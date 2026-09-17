import { defaultEconomyModule } from '@/database/entities/guild-module';
import { GuildMemberService } from '@/database/services/guild-member.service';
import { GuildModuleService } from '@/database/services/guild-module.service';
import { Command } from '@/structures/Command'

import { EmbedUI } from '@/ui/EmbedUI'
import { createCooldown, formatTimeLeft } from '@/utils'

interface HandleWorkContext {
    userId: string;
    guildId: string;
    username: string;
    reply: (data: any) => Promise<any>;
}

const handleWorkCommand = async ({
    userId,
    guildId,
    username,
    reply
}: HandleWorkContext) => {
    const memberKey = { userId, guildId }

    const memberDatabase = await GuildMemberService.findOrCreate(memberKey);
    const guildEcoModule = await GuildModuleService.findByName(guildId, 'economy') ?? defaultEconomyModule;

    const COOLDOWN = guildEcoModule.workCooldown * 60 * 1000;
    const MIN_REWARD = guildEcoModule.workMinGain;
    const MAX_REWARD = guildEcoModule.workMaxGain;

    const { isActive, expireTimestamp } = createCooldown(memberDatabase.lastWorkedAt, COOLDOWN);

    if (isActive) {
        return reply({
            embeds: [
                EmbedUI.createMessage({
                    color: 'red',
                    title: '⏳ Travail déjà effectué',
                    description: `Vous devez attendre encore ${formatTimeLeft(expireTimestamp)} avant de retravailler`,
                })
            ]
        });
    }

    let reward = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;

    const chance = Math.random();
    let bonus = 0;
    let phraseBonus = '';

    if (chance < 0.1) {
        bonus = Math.floor(Math.random() * 50) + 20;
        reward += bonus;
        phraseBonus = `🎉 Chance incroyable ! Vous obtenez un bonus de **${bonus} pièces** !`;
    } else if (chance < 0.3) {
        bonus = Math.floor(Math.random() * 20) + 5;
        reward += bonus;
        phraseBonus = `✨ Aujourd'hui, vous avez un petit bonus de **${bonus} pièces** !`;
    }

    await GuildMemberService.setLastWorkedAt(memberKey);
    await GuildMemberService.addCoins(memberKey, reward);

    const phrases = [
        `Bravo ! Vous avez travaillé dur aujourd'hui et gagné **${reward} pièces** !`,
        `Vous avez bien travaillé et gagné **${reward} pièces** !`,
        `Super travail ! Vos efforts rapportent **${reward} pièces** !`
    ];

    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    return reply({
        embeds: [
            EmbedUI.createMessage({
                color: 'green',
                title: `💼 Travail de ${username}`,
                description: phrase + (phraseBonus ? `\n${phraseBonus}` : ''),
            }),
        ],
    });
};

export default new Command({
    description: '👷 Work to earn daily server coins',
    nameLocalizations: {
        fr: 'travail',
    },
    descriptionLocalizations: {
        fr: '👷 Travail pour gagner des pièces de serveur quotidiennement'
    },
    messageCommand: {
        style: 'flat',
        aliases: ['work', 'w'],
    },
    access: {
        guild: {
            modules: {
                economy: { isWorkEnabled: true }
            }
        }
    },
    async onInteraction(interaction) {
        return handleWorkCommand({
            userId: interaction.user.id,
            guildId: interaction.guild!.id,
            username: interaction.user.globalName ?? interaction.user.username,
            reply: (data) => interaction.reply(data)
        });
    },
    async onMessage(message) {
        return handleWorkCommand({
            userId: message.author.id,
            guildId: message.guild!.id,
            username: message.author.globalName ?? message.author.username,
            reply: (data) => message.reply(data)
        });
    }
});
