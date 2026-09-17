import { Command } from '@/structures/Command'
import { ChannelType, ComponentType, GuildPremiumTier, MessageFlags } from 'discord.js'

import { ContainerUI } from '@/ui/ContainerUI'

import { createSection, createTextDisplay, createThumbnail } from '@/ui/components/common'

import { escapeAllMarkdown, formatCompactNumber, getDominantColor } from '@/utils'
import { applicationEmojiHelper } from '@/helpers'

const formatPremiumTier = (tier: GuildPremiumTier) => {
    return tier === 3 ? 'Nv. **MAX**' : tier === 0 ? 'Aucun niveau' : `Nv. **${tier}**`;
}

export default new Command({
    description: "📋 Retrieves a guild's information",
    descriptionLocalizations: {
        fr: "📋 Récupère les informations du serveur"
    },
    async onInteraction(interaction) {
        await interaction.deferReply();

        const guild = interaction.guild;

        const {
            stageChannelEmoji,
            textChannelEmoji,
            voiceChannelEmoji,
            categoryChannelEmoji,
            onlineEmoji,
            dndEmoji,
            idleEmoji,
            whiteArrowEmoji
        } = applicationEmojiHelper();

        const allMembers = interaction.guild.members.cache
        const channels = interaction.guild.channels.cache

        const memberCounts = {
            total: allMembers.size,
            members: 0,
            bots: 0,
            online: 0,
            dnd: 0,
            idle: 0
        };

        allMembers.forEach(m => {
            if (m.user.bot) memberCounts.bots++; else memberCounts.members++;

            const status = m.presence?.status;
            if (status === 'online') memberCounts.online++;
            else if (status === 'dnd') memberCounts.dnd++;
            else if (status === 'idle') memberCounts.idle++;
        });

        const channelCounts = {
            total: channels.size,
            text: 0,
            voice: 0,
            stage: 0,
            category: 0
        };

        channels.forEach((c) => {
            switch (c?.type) {
                case ChannelType.GuildText: channelCounts.text++; break;
                case ChannelType.GuildVoice: channelCounts.voice++; break;
                case ChannelType.GuildStageVoice: channelCounts.stage++; break;
                case ChannelType.GuildCategory: channelCounts.category++; break;
            }
        });

        const createdTimestamp = Math.floor(guild.createdTimestamp / 1000);
        const defaultInfo = [
            createTextDisplay(`## ${escapeAllMarkdown(guild.name)}`),
            createTextDisplay([
                guild.description && `> ${guild.description}`,
                `**Identifiant**`,
                `- **\`${guild.id}\`**`,
                `**Propriétaire**`,
                `- <@${guild.ownerId}>`,
                `- **\`(${guild.ownerId})\`**`,
                `**Niveau de boost**`,
                `- ${formatPremiumTier(guild.premiumTier)}`,
                `**Nombre de boost**`,
                `- ${guild.premiumSubscriptionCount}`,
                `**Création du serveur**`,
                `- <t:${createdTimestamp}>`,
                `- <t:${createdTimestamp}:R>`,
            ].filter(Boolean).join('\n'))
        ];

        const sections: any[] = [];

        if (guild.banner) {
            sections.push({
                type: ComponentType.MediaGallery,
                items: [{ media: { url: guild.bannerURL({ size: 1024 }) } }]
            });
        }

        const guildIconURL = guild.iconURL({ forceStatic: true });
        if (guildIconURL) {
            sections.push(createSection({
                accessory: createThumbnail({ url: guildIconURL }),
                components: defaultInfo
            }));
        } else {
            sections.push(...defaultInfo);
        }

        const createStatLine = (emoji: any, label: any, count: any) => {
            return `${emoji} ${whiteArrowEmoji} **${count}** ${label}`;
        }

        sections.push(createTextDisplay([
            '**Salons**',
            createStatLine('🏷️', 'salons totaux', channelCounts.total),
            createStatLine(textChannelEmoji, 'salons textuels', channelCounts.text),
            createStatLine(voiceChannelEmoji, 'salons vocaux', channelCounts.voice),
            createStatLine(stageChannelEmoji, 'salons de conférences', channelCounts.stage),
            createStatLine(categoryChannelEmoji, 'catégories', channelCounts.category)
        ].join('\n')));

        sections.push(createTextDisplay([
            '**Membres**',
            guild.maximumMembers && createStatLine('📈', 'capacitée max', formatCompactNumber(guild.maximumMembers)),
            createStatLine('😀', 'membres totaux', memberCounts.total),
            createStatLine('👤', 'membres', memberCounts.members),
            createStatLine('🤖', 'bots', memberCounts.bots),
            createStatLine(onlineEmoji, 'en ligne', memberCounts.online),
            createStatLine(dndEmoji, 'en ne pas déranger', memberCounts.dnd),
            createStatLine(idleEmoji, 'en inactivité', memberCounts.idle)
        ].filter(Boolean).join('\n')));

        return interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { repliedUser: false },
            components: [ContainerUI.create({
                color: guildIconURL ? await getDominantColor(guildIconURL) : undefined,
                components: sections
            })]
        });
    }
});
