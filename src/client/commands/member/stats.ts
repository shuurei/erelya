import { Command, CustomClient } from '@/structures'
import { ApplicationCommandOptionType, GuildMember } from 'discord.js'

import { EmbedUI } from '@/ui'

import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import { getDominantColor, parseUserMention } from '@/utils'
import { GuildMemberService } from '@/database/services/guild-member.service'

const formatTime = (minutes: number) => {
    if (!minutes) return '**0** min';

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return h > 0
        ? m > 0
            ? `**${h.toLocaleString('en')}** heures et **${m}** min`
            : `**${h.toLocaleString('en')}** heures`
        : `**${m}** min`;
};

const buildEmbed = async (member: GuildMember, client: CustomClient) => {
    const { whiteArrowEmoji } = applicationEmojiHelper();

    if (client.callSessions.cache.has(member.user.id)) {
        await client.callSessions.flush(member.user.id, member.guild.id);
    }

    const [
        memberHelper,
        memberDatabase
    ] = await Promise.all([
        guildMemberHelper(member),
        GuildMemberService.findById({ userId: member.id, guildId: member.guild.id })
    ]);

    const memberAvatarDominantColor = await getDominantColor(memberHelper.getAvatarURL());

    const {
        messageCount = 0,
        callPublicMinutes = 0,
        callPrivateMinutes = 0,
        callActiveMinutes = 0,
        callDeafMinutes = 0,
        callMutedMinutes = 0,
        callStreamingMinutes = 0,
        callCameraMinutes = 0,
        totalPortalCompleted = 0,
        redPortalCompleted = 0,
        yellowPortalCompleted = 0,
        bluePortalCompleted = 0,
        greenPortalCompleted = 0
    } = memberDatabase ?? {};

    return EmbedUI.create({
        color: memberAvatarDominantColor,
        description: `> 💡 Voici un résumé de votre activité sur le serveur !`,
        thumbnail: {
            url: memberHelper.getAvatarURL()
        },
        title: `${memberHelper.getName({ safe: true })} — Serveur Stats`,
        fields: [
            {
                name: '💬 Messages envoyés',
                value: `- ✨ **Total** ${whiteArrowEmoji} **${messageCount.toLocaleString('en')}**`
            },
            {
                name: '🔊 Temps en vocal',
                value: [
                    `- 🌐 **Public** ${whiteArrowEmoji} ${formatTime(callPublicMinutes)}`,
                    `- 🔒 **Privé** ${whiteArrowEmoji} ${formatTime(callPrivateMinutes)}`,
                    `- 🎙️ **Actif** ${whiteArrowEmoji} ${formatTime(callActiveMinutes)}`,
                    `- 🙊 **Muté** ${whiteArrowEmoji} ${formatTime(callMutedMinutes)}`,
                    `- 🙉 **Sourdine** ${whiteArrowEmoji} ${formatTime(callDeafMinutes)}`,
                    `- 🎥 **Stream** ${whiteArrowEmoji} ${formatTime(callStreamingMinutes)}`,
                    `- 📹 **Caméra** ${whiteArrowEmoji} ${formatTime(callCameraMinutes)}`,
                    `- ✨ **Total** ${whiteArrowEmoji} ${formatTime(callActiveMinutes + callMutedMinutes + callDeafMinutes)}`
                ].join('\n')
            },
            {
                name: '🌌 Portails',
                value: [
                    `- 🏆 **Total terminé** ${whiteArrowEmoji} **${totalPortalCompleted}**`,
                    `- 🔴 **Portails rouges terminés** ${whiteArrowEmoji} **${redPortalCompleted}**`,
                    `- 🟢 **Portails verts terminés** ${whiteArrowEmoji} **${greenPortalCompleted}**`,
                    `- 🔵 **Portails bleus terminés** ${whiteArrowEmoji} **${bluePortalCompleted}**`,
                    `- 🟡 **Portails jaunes terminés** ${whiteArrowEmoji} **${yellowPortalCompleted}**`
                ].join('\n')
            }
        ],
        footer: {
            iconURL: member.guild.iconURL() ?? undefined,
            text: member.guild.name,
        },
        timestamp: Date.now()
    });
}

export default new Command({
    description: "📊 Retrieves a user's stats",
    descriptionLocalizations: {
        fr: "📊 Récupère les stats d'un utilisateur"
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
        const member = interaction.options.getMember('member') ?? interaction.member;

        return await interaction.reply({
            allowedMentions: {},
            embeds: [await buildEmbed(member, this.client)],
        });
    },
    async onMessage(message, { args: [userId] }) {
        const member = (userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member) as GuildMember;

        return await message.reply({
            allowedMentions: {},
            embeds: [await buildEmbed(member as GuildMember, this.client)],
        });
    }
});
