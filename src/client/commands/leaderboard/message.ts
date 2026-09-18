import { Command } from '@/structures/Command'
import { GuildMember } from 'discord.js'

import { EmbedUI } from '@/ui/EmbedUI'

import { escapeAllMarkdown, getDominantColor } from '@/utils'
import { applicationEmojiHelper, guildMemberHelperSync } from '@/helpers'
import { GuildMemberService } from '@/database/services/guild-member.service'
import { MoreThan } from 'typeorm'

const buildEmbed = async (member: GuildMember) => {
    const userId = member.user.id;
    const guild = member.guild;

    const rankers = (await GuildMemberService.repo.find({
        where: { guildId: guild.id, messageCount: MoreThan(0) }
    })).sort((a, b) => b.messageCount - a.messageCount);

    if (!rankers.length) {
        return EmbedUI.createMessage('Aucune donnée', { color: 'orange' })
    };

    const topUserIds = rankers.slice(0, 10).map(r => r.userId);
    const topMembersMap = new Map(
        (await guild.members.fetch({ user: topUserIds }))
            .filter(m => m && !m.user.bot)
            .map(m => [m.user.id, m])
    );

    const { whiteArrowEmoji } = applicationEmojiHelper();
    const medals = ['🥇', '🥈', '🥉'];

    const top = rankers.slice(0, 10)
        .filter(r => topMembersMap.has(r.userId))
        .map((r,i) => {
            const memberObj = topMembersMap.get(r.userId)!;
            const memberHelper = guildMemberHelperSync(memberObj);
            const place = medals[i] ?? `**${i + 1}**`;
            const isAuthor = r.userId === userId;
            const name = memberHelper.getName()

            return `- ${place} ${isAuthor ? `**\`${name}\`**` : `\`${name}\``} ${whiteArrowEmoji} **${r.messageCount.toLocaleString('en')}** messages`;
        }).join('\n');

    const leaderboardIndex = rankers.findIndex(r => r.userId === userId);
    const totalMessageSents = rankers.reduce((sum, r) => sum + r.messageCount, 0);

    const guildIcon = guild.iconURL();
    const guildIconDominantColor = guildIcon ? await getDominantColor(guildIcon) : undefined;

    const memberHelper = guildMemberHelperSync(member);

    return EmbedUI.create({
        title: `Classement des plus bavards de ${escapeAllMarkdown(guild.name)}`,
        color: guildIconDominantColor,
        thumbnail: guildIcon ? { url: guildIcon } : undefined,
        description: [
            `> 💬 **${totalMessageSents.toLocaleString('en')}** messages cumulés sur le serveur`,
            topMembersMap.size < 10 ? `***TOP ${topMembersMap.size}***` : `***TOP 10 sur ${rankers.length.toLocaleString('en')} membres***`,
            top,
            leaderboardIndex >= 10 ? `- **..${leaderboardIndex + 1}** **\`${memberHelper.getName()}\`** ${whiteArrowEmoji} **${rankers[leaderboardIndex].messageCount.toLocaleString('en')}** messages` : ''
        ].join('\n'),
        timestamp: Date.now()
    });
}

export default new Command({
    nameLocalizations: {
        fr: 'message'
    },
    description: "🏆 Shows the top members by messages sent",
    descriptionLocalizations: {
        fr: "🏆 Affiche le classement des meilleurs membres par message envoyés"
    },
    messageCommand: {
        style: 'flat',
        aliases: [ 'ttext', 'toptext' ]
    },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return await interaction.editReply({
            allowedMentions: {},
            embeds: [await buildEmbed(interaction.member)],
        });
    },
    async onMessage(message) {
        return await message.reply({
            allowedMentions: {},
            embeds: [await buildEmbed(message.member as GuildMember)],
        });
    }
});
