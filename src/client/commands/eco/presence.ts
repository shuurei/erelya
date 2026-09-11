import { GuildMember } from 'discord.js'
import { DateTime } from 'luxon'

import { Command } from '@/structures/Command'
import { EmbedUI, EmbedUIData } from '@/ui/EmbedUI'

import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import { formatCompactNumber, formatTimeLeft, getDominantColor, randomNumber, tzMap } from '@/utils'

import { memberService } from '@/database/services'

const MIN_REWARD = 250;
const MAX_REWARD = 750;

const STREAK_STEP = 7;

const STREAK_MULTIPLIERS = [
    { days: 100, multiplier: 4 },
    { days: 75, multiplier: 3.5 },
    { days: 50, multiplier: 3 },
    { days: 30, multiplier: 2.5 },
    { days: 21, multiplier: 2.25 },
    { days: 14, multiplier: 2 },
    { days: 7, multiplier: 1.75 },
] as const;

const getStreakMultiplier = (streak: number) => {
    return STREAK_MULTIPLIERS.find(({ days }) => streak >= days)?.multiplier ?? 1;
};

const FLAME_MILESTONES = [
    { days: 1, flame: '🔥', name: 'Petite flamme' },
    { days: 3, flame: '🔥', name: 'Flamme' },
    { days: 7, flame: '🔥', name: 'Flamme vivante' },
    { days: 10, flame: '🔥', name: 'Flamme grandissante' },
    { days: 14, flame: '🔥', name: 'Flamme ardente' },
    { days: 21, flame: '🔥', name: 'Grosse Flamme' },
    { days: 30, flame: '🔥', name: 'Flamme impresionante' },
    { days: 40, flame: '🔥', name: 'Flamme intense' },
    { days: 50, flame: '🔥', name: 'Petite flamme violette' },
    { days: 60, flame: '🔥', name: 'Flamme violette' },
    { days: 75, flame: '🔥', name: 'Flamme violette ardante' },
    { days: 90, flame: '🔥', name: 'Petite flamme bleue' },
    { days: 100, flame: '🔥', name: 'Flamme bleue' },
    { days: 125, flame: '🔥', name: 'Flamme bleu ardante' },
    { days: 150, flame: '🔥', name: 'Flamme mystique' },
    { days: 200, flame: '🔥', name: 'Flamme abyssale' },
    { days: 250, flame: '🔥', name: 'Flamme légendaire' },
    { days: 365, flame: '🔥', name: 'Flamme éternelle' }
] as const;

const getFlameData = (streak: number) => {
    return [...FLAME_MILESTONES]
        .reverse()
        .find(({ days }) => streak >= days) ?? FLAME_MILESTONES[0];
};

const getMilestone = (streak: number) => {
    return FLAME_MILESTONES.find(({ days }) => days === streak);
};

const buildEmbed = async (member: GuildMember) => {
    const { whiteArrowEmoji } = applicationEmojiHelper();

    const userId = member.user.id;
    const guildId = member.guild.id;
    const guildLocale = member.guild.preferredLocale;
    const guildTZ = tzMap[guildLocale] || 'UTC';
    const memberKey = { userId, guildId };

    const memberHelper = await guildMemberHelper(member, { fetchAll: true });
    const memberAvatarDominantColor = await getDominantColor(memberHelper.getAvatarURL({ forceStatic: true }));

    let { dailyStreak, lastAttendedAt } = await memberService.findOrCreate(memberKey);

    const lastInGuildTZ = lastAttendedAt ? DateTime.fromJSDate(lastAttendedAt, { zone: guildTZ }) : null;
    const nowInGuildTZ = DateTime.now().setZone(guildTZ);
    const midnightInGuildTZ = nowInGuildTZ.endOf('day');
    const isSameDay = lastInGuildTZ ? lastInGuildTZ.hasSame(nowInGuildTZ, 'day') : false;

    let message: string;

    const payload = {
        thumbnail: { url: memberHelper.getAvatarURL() },
        title: `Présence de ${memberHelper.getName()}`,
        timestamp: Date.now(),
        footer: { text: `Les données de présence sont réinitialisées à minuit` }
    } as Partial<EmbedUIData>;

    const getDailyStreakDay = () => dailyStreak % STREAK_STEP || STREAK_STEP;

    if (isSameDay) {
        payload.color = memberAvatarDominantColor;

        message = `Vous devez attendre encore ${formatTimeLeft(midnightInGuildTZ.toMillis(), { now: nowInGuildTZ.toMillis() })} avant de refaire valoir votre présence !`;
    } else {
        const yesterdayInGuildTZ = nowInGuildTZ.minus({ days: 1 });

        const isSameDayAsYesterday = lastInGuildTZ
            ? lastInGuildTZ.hasSame(yesterdayInGuildTZ, 'day')
            : false;

        const data = isSameDayAsYesterday
            ? await memberService.incrementDailyStreak(memberKey)
            : await memberService.resetDailyStreak(memberKey);

        dailyStreak = data.dailyStreak;

        const baseReward = randomNumber(MIN_REWARD, MAX_REWARD);
        const streakMultiplier = getStreakMultiplier(dailyStreak);
        const totalReward = Math.floor(baseReward * streakMultiplier);

        const milestone = getMilestone(dailyStreak);
        const flameData = getFlameData(dailyStreak);

        await Promise.all([
            memberService.setLastAttendedAt(memberKey),
            memberService.addGuildCoins(memberKey, totalReward)
        ]);

        if (milestone) {
            message = [
                `${milestone.flame} **${milestone.name}** atteinte !`,
                '',
                `🔥 **Jour ${dailyStreak}** !`,
                `Vous gagnez **${formatCompactNumber(totalReward)} pièces**`,
                `(multiplicateur x${streakMultiplier}) 🎉`
            ].join('\n');
        } else if (streakMultiplier > 1) {
            message = `${flameData.flame} **Jour ${dailyStreak}** ! ` +
                `Vous gagnez **${formatCompactNumber(totalReward)} pièces** ` +
                `(multiplicateur x${streakMultiplier})`;
        } else {
            message = `${flameData.flame} Vous avez gagné ` +
                `**${formatCompactNumber(totalReward)} pièces** ` +
                `pour votre présence d'aujourd'hui !`;
        }
    }

    const streakDay = getDailyStreakDay();

    const currentMultiplier = getStreakMultiplier(dailyStreak);
    const currentFlame = getFlameData(dailyStreak);

    const nextMilestone = FLAME_MILESTONES.find(({ days }) => days > dailyStreak);

    const progressText = nextMilestone
        ? `Encore **${nextMilestone.days - dailyStreak}** jour${nextMilestone.days - dailyStreak > 1 ? 's' : ''} avant la prochaine évolution`
        : `👑 **Vous avez atteint le dernier palier !**`;

    return EmbedUI.createMessage({
        color: 'green',
        ...payload,
        description: message,
        fields: [
            {
                name: 'Progression',
                value: [
                    progressText,
                    `${Array.from({ length: STREAK_STEP }, (_, i) => { return i < streakDay ? '▰' : '▱'; }).join('')} (${dailyStreak % STREAK_STEP || 7} / 7)`
                ].join('\n'),
                inline: true
            },
            {
                name: 'Série quotidienne',
                value: `${currentFlame.flame} ${whiteArrowEmoji} ` +
                    `**${dailyStreak}** jours\n` +
                    `*${currentFlame.name}*`,
                inline: true
            },
            ...(currentMultiplier > 1
                ? [
                      {
                          name: 'Multiplicateur',
                          value: `🪙 **x${currentMultiplier}** sur vos gains`,
                          inline: true
                      }
                  ]
                : [])
        ]
    });
};

export default new Command({
    nameLocalizations: {
        fr: 'présence'
    },
    description: '⌛ Execute every day to earn daily server coins',
    descriptionLocalizations: {
        fr: '⌛ Faite votre présence tous les jours pour gagner des pièces de serveur quotidiennement'
    },
    messageCommand: {
        style: 'flat',
        aliases: [ 'presence', 'p', 'daily' ]
    },
    access: {
        guild: { modules: { eco: true } }
    },
    async onInteraction(interaction) {
        await interaction.deferReply();

        return await interaction.editReply({
            embeds: [await buildEmbed(interaction.member)]
        });
    },
    async onMessage(message) {
        return await message.reply({
            embeds: [await buildEmbed(message.member as GuildMember)]
        });
    }
});