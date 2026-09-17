import { Command } from '@/structures'
import { ApplicationCommandOptionType, GuildMember, MessageFlags } from 'discord.js'

import { UserService } from '@/database/services/user.service'

import { createMediaGallery, createSection, createSeparator, createTextDisplay, createThumbnail } from '@/ui/components/common'
import { ContainerUI } from '@/ui'

import { guildMemberHelper } from '@/helpers'
import { getDominantColor, parseUserMention } from '@/utils'
import { UserDatabaseFlags } from '@/utils/user-flags'

const toDiscordTimestamp = (date?: number | Date | null) => {
    return date ? Math.floor(new Date(date).getTime() / 1000) : null;
}

const buildContainer = async (member: GuildMember) => {
    const helper = await guildMemberHelper(member, { fetchAll: true });

    const avatar = helper.getAvatarURL({ forceStatic: true });
    const banner = helper.getBannerURL({ size: 1024 });

    const [ dominantColor, userDatabase ] = await Promise.all([
        getDominantColor(avatar),
        member.user.bot ? null : UserService.findById(member.id)
    ]);

    const createdAt = toDiscordTimestamp(member.user.createdTimestamp);
    const joinedAt = toDiscordTimestamp(member.joinedTimestamp);
    const premiumSinceAt = toDiscordTimestamp(member.premiumSinceTimestamp);
    const tagAssignedAt = toDiscordTimestamp(userDatabase?.tagAssignedAt);

    const hasGuildTag = member.user.primaryGuild?.identityGuildId === member.guild.id;

    const components = [];

    if (banner) {
        components.push(
            createMediaGallery([{ media: { url: banner } }])
        );
    }

    const infoLines = [
        `**Identifiant**`,
        `- **\`${member.id}\`**`,
        `**Nom d'utilisateur**`,
        `- **\`${member.user.username}\`**`,
    ];

    if (tagAssignedAt && hasGuildTag) {
        infoLines.push(
            `**Porte le tag du serveur depuis**`,
            `- <t:${tagAssignedAt}>`,
            `- <t:${tagAssignedAt}:R>`
        );
    }

    if (premiumSinceAt) {
        infoLines.push(
            `**Booster du serveur depuis**`,
            `- <t:${premiumSinceAt}>`,
            `- <t:${premiumSinceAt}:R>`
        );
    }

    infoLines.push(
        `**Membre depuis**`,
        `- <t:${joinedAt}>`,
        `- <t:${joinedAt}:R>`,
        `**Création du compte**`,
        `- <t:${createdAt}>`,
        `- <t:${createdAt}:R>`
    );

    components.push(
        createSection({
            accessory: createThumbnail({ url: avatar }),
            components: [
                createTextDisplay(`## ${member}`),
                createTextDisplay(infoLines.join('\n'))
            ]
        })
    );

    if (member.user.bot || userDatabase?.flagsBitField?.any([ UserDatabaseFlags.TESTER ])) {
        components.push(createSeparator());

        if (member.user.bot) {
            components.push(
                createTextDisplay('-# *Cet utilisateur est un robot*')
            );
        } else if (userDatabase!.flagsBitField.has(UserDatabaseFlags.TESTER)) {
            components.push(
                createTextDisplay('-# *Cet utilisateur est bêta-testeur du bot*')
            );
        }
    }

    return ContainerUI.create({ color: dominantColor, components });
};

export default new Command({
    nameLocalizations: {
        fr: 'profil'
    },
    description: "😀 Retrieves a user's profile",
    descriptionLocalizations: {
        fr: "😀 Récupère le profil d'un utilisateur"
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

        return interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {},
            components: [await buildContainer(member)]
        });
    },
    async onMessage(message, { args: [userId] }) {
        const member = (userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member) as GuildMember;

        return message.reply({
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: {},
            components: [await buildContainer(member as GuildMember)]
        });
    }
});
