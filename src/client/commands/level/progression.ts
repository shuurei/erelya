import { ApplicationCommandOptionType, GuildMember } from 'discord.js'
import { Command } from '@/structures'

import { createProgressBar } from '@/ui/components'

import { GuildMemberService } from '@/database/services/guild-member.service'
import { GuildModuleService } from '@/database/services/guild-module.service'

import { formatMedalRank, getDominantColor, levelToXp, parseUserMention, xpToNextLevel } from '@/utils'
import { guildMemberHelper } from '@/helpers'

import { EmbedUI } from '@/ui'

const buildPayload = async (member: GuildMember) => {
    const helper = await guildMemberHelper(member);

    if (member.user.bot) {
        return {
            embeds: [EmbedUI.createErrorMessage({
                title: `Niveau de ${helper.getName({ safe: true })}`,
                description: `Les robots ne possèdent pas de progression d'XP ni de rang dans le classement !`
            })]
        };
    }

    const userId = member.id;
    const guild = member.guild;
    const guildId = guild.id;

    const [memberDatabase, leaderboard, { maxLevel }] = await Promise.all([
        GuildMemberService.findOrCreate({ guildId, userId }),
        GuildMemberService.getActivityXpRank({ guildId, userId }),
        GuildModuleService.findOrCreate(guildId, 'level'),
    ]);

    const activityXp = memberDatabase.xp ?? 0;

    const { currentXp, currentLevel, nextLevel, xpProgress, xpForLevel } = xpToNextLevel(activityXp);

    const isLastLevel = nextLevel >= maxLevel;
    const maxLevelReached = currentLevel >= maxLevel;

    const fields = [
        {
            name: maxLevelReached ? 'Niveau max' : 'Niveau',
            value: maxLevelReached
                ? `**${maxLevel}**`
                : `**${currentLevel.toLocaleString('en')}** ➜ **${isLastLevel ? 'MAX' : nextLevel.toLocaleString('en')}**`,
            inline: true
        },
    ];

    if (maxLevelReached) {
        fields.push({
            name: "Total d'XP",
            value: levelToXp(maxLevel).toLocaleString('en'),
            inline: true
        });
    } else {
        fields.push({
            name: 'Progression',
            value: [
                createProgressBar(Math.max(0, xpProgress / xpForLevel), { length: 7, asciiChar: true, showPercentage: true }),
                `**${xpProgress.toLocaleString('en')}** / **${xpForLevel.toLocaleString('en')}** XP`
            ].join('\n'),
            inline: true
        });
    }

    if (leaderboard) {
        fields.push({
            name: 'Rang',
            value: activityXp > 0 && leaderboard.total > 5
                ? `**${formatMedalRank(leaderboard.rank)}** / **${leaderboard.total.toLocaleString('en')}**`
                : '*Non Classé*',
            inline: true
        });
    }

    if (!maxLevelReached) {
        fields.push({
            name: "Total d'XP",
            value: currentXp.toLocaleString('en'),
            inline: false
        });
    }

    return {
        embeds: [EmbedUI.create({
            color: await getDominantColor(helper.getAvatarURL({ forceStatic: true })),
            thumbnail: { url: helper.getAvatarURL() },
            title: `Niveau de ${helper.getName({ safe: true })}`,
            description: '> 💡 Seuls les membres avec de l’XP sont pris en compte dans le classement !',
            fields,
            footer: {
                iconURL: guild.iconURL() ?? undefined,
                text: guild.name
            },
            timestamp: Date.now()
        })]
    } as const;
};

export default new Command({
    description: "🧪 Display a member's progression",
    descriptionLocalizations: {
        fr: "🧪 Afficher la progression d'un membre"
    },
    access: {
        guild: {
            modules: {
                level: { isEnabled: true }
            }
        }
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'member',
                description: 'member',
                name_localizations: {
                    fr: 'membre'
                },
                description_localizations: {
                    fr: 'membre'
                }
            }
        ]
    },
    async onInteraction(interaction) {
        await interaction.deferReply();

        const member = interaction.options.getMember('member') ?? interaction.member;

        return await interaction.editReply(await buildPayload(member));
    },
    async onMessage(message, { args: [userId] }) {
        const member = userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member;

        if (member) {
            return await message.reply(await buildPayload(member));
        }
    }
});