import { Command } from '@/structures/Command'

import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import { createActionRow, createButton } from '@/ui/components/common'
import { createProgressBar } from '@/ui/components'
import { EmbedUI } from '@/ui'

import { handleMemberCheckLevelUp } from '@/client/handlers/member-check-level-up'

import { formatTimeLeft, formatTimeLeftFromMinutes, getDominantColor, tzMap } from '@/utils'
import { DateTime } from 'luxon'

import { handleMemberDailyQuestSync } from '@/client/handlers/member-daily-quest-sync'
import { calculateQuestBonusMultiplier, STREAMING_POOL, VOICE_POOL } from '@/utils/daily-quest'
import { GuildModuleService } from '@/database/services/guild-module.service'
import { GuildMemberService } from '@/database/services/guild-member.service'
import { GuildMemberDailyQuestService } from '@/database/services/guild-member-daily-quest.service'
import { GuildMemberDailyQuestType } from '@/database/entities/guild-member/daily-quest.entity'

export default new Command({
    nameLocalizations: { fr: 'quotidienne' },
    description: "🎯 View your daily quest",
    descriptionLocalizations: { fr: "🎯 Consulte ta quête quotidienne du jour" },
    access: {
        guild: {
            modules: {
                economy: { isEnabled: true },
                level: { isEnabled: true },
                quest: { isEnabled: true, isVoiceQuestEnabeld: true }
            }
        }
    },
    async onInteraction(interaction) {
        await interaction.deferReply();

        const guild = interaction.guild;
        const guildId = guild.id;

        const [guildEcoModule, guildLevelModule] = await Promise.all([
            GuildModuleService.findOrCreate(guildId, 'economy'),
            GuildModuleService.findOrCreate(guildId, 'level'),
        ]);

        const { whiteArrowEmoji } = applicationEmojiHelper();

        const member = interaction.member;
        const userId = member.user.id;

        const guildLocale = member.guild.preferredLocale;
        const guildTZ = tzMap[guildLocale] || 'UTC';

        const memberKey = { userId, guildId }

        const memberHelper = await guildMemberHelper(member, { fetchAll: true });
        const memberAvatarDominantColor = await getDominantColor(memberHelper.getAvatarURL({ forceStatic: true }));

        let questDatabase = await handleMemberDailyQuestSync(memberKey, guildLocale);

        const nowInGuildTZ = DateTime.now().setZone(guildTZ);
        const midnightInGuildTZ = nowInGuildTZ.endOf('day');

        const quest = (questDatabase.type === GuildMemberDailyQuestType.CALL ? VOICE_POOL : STREAMING_POOL).find((f) => f.value === questDatabase.target);
        if (!quest) {
            throw new Error('No quest found : ', { cause: quest });
        }

        const bonusMultiplier = calculateQuestBonusMultiplier(quest);

        const fields = [];

        fields.push({
            name: questDatabase.type === GuildMemberDailyQuestType.CALL
                ? '🔊 Vocal'
                : '🎥 Streaming',
            value: [
                `**${formatTimeLeftFromMinutes(questDatabase.progress)}** / **${formatTimeLeftFromMinutes(quest.value)}**`,
                createProgressBar(Math.max(0, questDatabase.progress / quest.value), { length: 7, asciiChar: true, showPercentage: true }),
            ].join('\n'),
            inline: true
        });

        const guildCoinsReward = Math.floor((quest.rewards.guildCoins ?? 0) * bonusMultiplier);
        const activityXpReward = Math.floor((quest.rewards.activityXp ?? 0) * bonusMultiplier);

        fields.push({
            name: 'Récompenses',
            value: [
                guildEcoModule?.isEnabled && `- :coin: Pièces de serveur ${whiteArrowEmoji} **${guildCoinsReward.toLocaleString('en')}**`,
                guildLevelModule?.isEnabled && `- 🧪 XP ${whiteArrowEmoji} **${activityXpReward.toLocaleString('en')}**`
            ].filter(Boolean).join('\n'),
            inline: true
        });

        const isCompleted = questDatabase.progress >= quest.value;

        const payload = {
            color: memberAvatarDominantColor,
            thumbnail: { url: memberHelper.getAvatarURL() },
            title: 'Quête quotidienne 🎯',
            description: [
                `> 💡 Complétez **tous les objectifs à 100%** pour réclamer la récompense, la quête se réinitialise chaque jour à minuit`,
                `- ⏳ Temps avant réinitialisation ${whiteArrowEmoji} **${formatTimeLeft(midnightInGuildTZ.toMillis(), { now: nowInGuildTZ.toMillis() })}**`
            ].join('\n'),
            fields,
            footer: { text: interaction.guild.name },
            timestamp: Date.now()
        }

        const getClaimButton = () => questDatabase?.isClaimed
            ? createButton('Déjà récupéré', {
                color: 'red',
                customId: '#claimed',
                disabled: true
            }) : createButton('Récupérer', {
                color: 'green',
                customId: 'claim',
                disabled: !isCompleted
            });

        const msg = await interaction.editReply({
            embeds: [
                EmbedUI.create(payload)
            ],
            components: [
                createActionRow([getClaimButton()])
            ]
        });

        if (questDatabase.isClaimed || !isCompleted) return;

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === userId,
            time: 30_000
        });

        collector.on('collect', async (i) => {
            let questDatabase = await GuildMemberDailyQuestService.findById(memberKey);
            if (!questDatabase) {
                return i.reply('Il semblerait que la quête est déjà été recup ?');
            }

            if (questDatabase.isClaimed) {
                return await interaction.deleteReply();
            }

            questDatabase = await GuildMemberDailyQuestService.update(memberKey, { isClaimed: true });

            if (guildEcoModule?.isEnabled) {
                await GuildMemberService.addCoins(memberKey, guildCoinsReward);
            }

            if (guildLevelModule?.isEnabled) {
                await handleMemberCheckLevelUp({
                    member,
                    channel: interaction.channel,
                    xpGain: activityXpReward
                });
            }

            await i.update({
                embeds: [ EmbedUI.create(payload) ],
                components: [ createActionRow([getClaimButton()]) ]
            });

            collector.stop();
        });

        collector.on('end', async () => {
            if (!questDatabase.isClaimed) {
                return await interaction.deleteReply();
            }
        });
    }
});
