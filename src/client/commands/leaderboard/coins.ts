import { Command } from '@/structures/Command'
import { GuildMember } from 'discord.js'

import { EmbedUI } from '@/ui/EmbedUI'

import { escapeAllMarkdown, getDominantColor } from '@/utils'
import { applicationEmojiHelper, guildMemberHelperSync } from '@/helpers'
import { GuildMemberService } from '@/database/services/guild-member.service'
import { MoreThan } from 'typeorm'

const buildEmbed = async (member: GuildMember) => {
    const userId = member.user.id
    const guild = member.guild
    const guildId = guild.id

    const rankers = await GuildMemberService.repo.find({
        where: { guildId, coins: MoreThan(0) }
    });

    if (!rankers.length) {
        return EmbedUI.createMessage('Aucune donnée', { color: 'orange' })
    }

    const ranked = rankers
        .map((m) => ({ ...m, totalCoins: (m.coins ?? 0) }))
        .filter((m) => m.totalCoins > 0)
        .sort((a, b) => b.totalCoins - a.totalCoins);

    if (!ranked.length) {
        return EmbedUI.createMessage('Aucune donnée', { color: 'orange' })
    }

    const topUserIds = ranked.slice(0, 10).map(r => r.userId)

    const topMembersMap = new Map(
        (await guild.members.fetch({ user: topUserIds }))
            .filter(m => m && !m.user.bot)
            .map(m => [m.user.id, m])
    )

    const medals = ['🥇', '🥈', '🥉']
    const { whiteArrowEmoji } = applicationEmojiHelper()

    const top = ranked
        .slice(0, 10)
        .filter(r => topMembersMap.has(r.userId))
        .map((r, i) => {
            const memberObj = topMembersMap.get(r.userId)!
            const helper = guildMemberHelperSync(memberObj)
            const place = medals[i] ?? `**${i + 1}**`
            const isAuthor = r.userId === userId
            const name = helper.getName();

            return `- ${place} ${isAuthor ? `**\`${name}\`**` : `\`${name}\``} ${whiteArrowEmoji} **${r.totalCoins.toLocaleString('en')}** 💰`
        })
        .join('\n')

    const leaderboardIndex = ranked.findIndex(r => r.userId === userId)
    const totalCoinsServer = ranked.reduce((sum, r) => sum + r.totalCoins, 0)

    const guildIcon = guild.iconURL()
    const guildIconDominantColor = guildIcon
        ? await getDominantColor(guildIcon)
        : undefined

    const authorHelper = guildMemberHelperSync(member)

    return EmbedUI.create({
        title: `Classement des plus riches de ${escapeAllMarkdown(guild.name)}`,
        color: guildIconDominantColor,
        thumbnail: guildIcon ? { url: guildIcon } : undefined,
        description: [
            `> 💸 **${totalCoinsServer.toLocaleString('en')}** 💰 cumulés sur le serveur`,
            ranked.length < 10
                ? `***TOP ${ranked.length}***`
                : `***TOP 10 sur ${ranked.length.toLocaleString('en')} membres***`,
            top,
            leaderboardIndex >= 10
                ? `- **..${leaderboardIndex + 1}** **\`${authorHelper.getName()}\`** ${whiteArrowEmoji} **${ranked[leaderboardIndex].totalCoins.toLocaleString('en')}** 💰`
                : ''
        ].join('\n'),
        timestamp: Date.now()
    });
}

export default new Command({
    nameLocalizations: {
        fr: 'richesse'
    },
    description: '🏆 Shows the richest members on the server',
    descriptionLocalizations: {
        fr: '🏆 Affiche le classement des membres les plus riches du serveur'
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
        aliases: ['topcoins', 'tcoins']
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
