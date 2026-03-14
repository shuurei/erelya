import { ApplicationCommandOptionType, GuildMember } from 'discord.js'
import { Command } from '@/structures/Command'

import {
    memberService,
    memberVaultService,
    tierCapacity
} from '@/database/services'

import { EmbedUI } from '@/ui/EmbedUI'

import { formatCompactNumber, getDominantColor, parseUserMention } from '@/utils'
import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'

const buildEmbed = async (member: GuildMember) => {
    const { whiteArrowEmoji } = applicationEmojiHelper();

    const userId = member.user.id;
    const guildId = member.guild.id;

    const memberKey = {
        userId,
        guildId
    }

    const memberHelper = await guildMemberHelper(member, { fetchAll: true });
    const memberAvatarDominantColor = await getDominantColor(memberHelper.getAvatarURL({ forceStatic: true }));

    const memberGuildCoins = await memberService.getTotalGuildCoins(memberKey);
    const memberVault = await memberVaultService.findById(memberKey) ?? {
        capacityTier: 'TIER_0'
    };

    const vaultGuildCoinsCapacity = tierCapacity[memberVault.capacityTier].guildCoins?.capacity;

    return EmbedUI.createMessage({
        color: memberAvatarDominantColor,
        thumbnail: {
            url: memberHelper.getAvatarURL()
        },
        title: `Monnaies de ${memberHelper.getName()}`,
        description: `-# 💡 Ici sont rassemblées toutes les monnaies que vous avez acquises au cours de votre progression.`,
        fields: [
            {
                name: 'Pièces de Serveur',
                value: [
                    `- 🔐️ Coffre-Fort ${whiteArrowEmoji} **${formatCompactNumber(memberGuildCoins.inVault)}** / **${formatCompactNumber(vaultGuildCoinsCapacity)}**`,
                    `- :coin: Solde ${whiteArrowEmoji} **${formatCompactNumber(memberGuildCoins.inWallet)}**`,
                    (
                        (formatCompactNumber(memberGuildCoins.inVault) != formatCompactNumber(memberGuildCoins.total))
                        && (formatCompactNumber(memberGuildCoins.inWallet) != formatCompactNumber(memberGuildCoins.total))
                    ) && `- ✨ Total ${whiteArrowEmoji} **${formatCompactNumber(memberGuildCoins.total)}**`,
                ].filter(Boolean).join('\n')
            },
        ],
        timestamp: Date.now()
    })
};

export default new Command({
    nameLocalizations: {
        fr: 'monnaies'
    },
    description: "💰 Displays the currencies the user owns",
    descriptionLocalizations: {
        fr: "💰 Affiche les monnaies que possède l'utilisateur"
    },
    messageCommand: {
        style: 'flat',
        aliases: [
            'wallet',
            'balance',
            'bal',
            'bank'
        ]
    },
    access: {
        guild: {
            modules: {
                eco: true
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

        return await interaction.editReply({
            allowedMentions: {},
            embeds: [await buildEmbed(member)],
        });
    },
    async onMessage(message, { args: [userId] }) {
        const member = (
            userId
                ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
                : message.member
        ) as GuildMember;

        return await message.reply({
            allowedMentions: {},
            embeds: [await buildEmbed(member)],
        });
    }
});
