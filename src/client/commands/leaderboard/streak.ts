import { Command } from '@/structures/Command'
import { GuildMember } from 'discord.js'

import { EmbedUI } from '@/ui/EmbedUI'

import { escapeAllMarkdown, getDominantColor } from '@/utils'
import { applicationEmojiHelper, guildMemberHelperSync } from '@/helpers'
import { GuildMemberService } from '@/database/services/guild-member.service'
import { MoreThan, MoreThanOrEqual } from 'typeorm'

const buildEmbed = async (member: GuildMember) => {
    const userId = member.user.id
    const guild = member.guild

    const rankers = (await GuildMemberService.repo.find({
        where: {
            guildId: guild.id, dailyStreak: MoreThan(0),
            lastAttendedAt: MoreThanOrEqual(new Date(Date.now() - 48 * 60 * 60 * 1000))
        }
    })).sort((a, b) => {
        if (b.dailyStreak !== a.dailyStreak) {
            return b.dailyStreak - a.dailyStreak;
        }

        return (b as any)?.lastAttendedAt - (a as any)?.lastAttendedAt;
    });

    if (!rankers.length) {
        return EmbedUI.createMessage('Aucune donnée', { color: 'orange' })
    }

    const topUserIds = rankers.slice(0, 10).map(r => r.userId)
    const topMembersMap = new Map(
        (await guild.members.fetch({ user: topUserIds }))
            .filter(m => m && !m.user.bot)
            .map(m => [m.user.id, m])
    )

    const { whiteArrowEmoji } = applicationEmojiHelper()
    const medals = ['🥇', '🥈', '🥉']

    const top = rankers
        .slice(0, 10)
        .filter(r => topMembersMap.has(r.userId))
        .map((r, i) => {
            const memberObj = topMembersMap.get(r.userId)!
            const helper = guildMemberHelperSync(memberObj);
            const place = medals[i] ?? `**${i + 1}**`
            const isAuthor = r.userId === userId
            const name = helper.getName();

            return `- ${place} ${isAuthor ? `**\`${name}\`**` : `\`${name}\``} ${whiteArrowEmoji} **${r.dailyStreak.toLocaleString('en')}** jours`
        })
        .join('\n')

    const leaderboardIndex = rankers.findIndex(r => r.userId === userId)
    const totalStreaks = rankers.reduce((sum, r) => sum + r.dailyStreak, 0)

    const guildIcon = guild.iconURL()
    const guildIconDominantColor = guildIcon
        ? await getDominantColor(guildIcon)
        : undefined

    const memberHelper = guildMemberHelperSync(member)

    return EmbedUI.create({
        title: `Classement des séries quotidienne les plus solides de ${escapeAllMarkdown(guild.name)}`,
        color: guildIconDominantColor,
        thumbnail: guildIcon ? { url: guildIcon } : undefined,
        description: [
            `> 🔥 **${totalStreaks.toLocaleString('en')}** jours quotidiennement cumulés sur le serveur`,
            topMembersMap.size < 10
                ? `***TOP ${topMembersMap.size}***`
                : `***TOP 10 sur ${rankers.length.toLocaleString('en')} membres***`,
            top,
            leaderboardIndex >= 10
                ? `- **..${leaderboardIndex + 1}** **\`${memberHelper.getName()}\`** ${whiteArrowEmoji} **${rankers[leaderboardIndex].dailyStreak.toLocaleString('en')}** jours`
                : ''
        ].join('\n'),
        timestamp: Date.now()
    })
}

export default new Command({
    nameLocalizations: {
        fr: 'streak'
    },
    description: '🔥 Shows the top daily streaks',
    descriptionLocalizations: {
        fr: '🔥 Affiche le classement des meilleures séries quotidiennes'
    },
    access: {
        guild: {
            modules: {
                economy: { isEnabled: true }
            }
        }
    },
    messageCommand: {
        style: 'flat',
        aliases: ['topstreak', 'tstreak']
    },
    async onInteraction(interaction) {
        await interaction.deferReply()
        return await interaction.editReply({
            allowedMentions: {},
            embeds: [await buildEmbed(interaction.member)],
        })
    },
    async onMessage(message) {
        return await message.reply({
            allowedMentions: {},
            embeds: [await buildEmbed(message.member as GuildMember)],
        })
    }
})
