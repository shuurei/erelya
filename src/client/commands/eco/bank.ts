import { ApplicationCommandOptionType, GuildMember, MessageFlags } from 'discord.js'
import { Command } from '@/structures/Command'

import { ContainerUI } from '@/ui'
import { createSection, createTextDisplay, createThumbnail } from '@/ui/components/common'

import { getDominantColor, parseUserMention } from '@/utils'
import { guildMemberHelper } from '@/helpers'
import { GuildMemberService } from '@/database/services/guild-member.service'

const buildPayload = async (member: GuildMember) => {
    const memberHelper = await guildMemberHelper(member, { fetchAll: true });
    const memberAvatarDominantColor = await getDominantColor(memberHelper.getAvatarURL({ forceStatic: true }));

    const { coins } = await GuildMemberService.findOrCreate({ guildId: member.guild.id, userId: member.id });

    return {
        flags: MessageFlags.IsComponentsV2,
        components: [ContainerUI.create({
            color: memberAvatarDominantColor,
            components: [
                createSection({
                    accessory: createThumbnail({ url: memberHelper.getAvatarURL() }),
                    components: [
                        createTextDisplay(' > *💡 Ici sont stockés toutes les pièces de serveur que vous avez accumulés*'),
                        createTextDisplay([
                            `### - :coin: **Pièce de serveur**`,
                            `> \`${coins.toLocaleString('en')}\``,
                        ].join('\n'))
                    ]
                })
            ]
        })]
    } as const;
};

export default new Command({
    nameLocalizations: { fr: 'banque' },
    description: '💳 View your bank account',
    descriptionLocalizations: { fr: '💳 Consulte ton compte bancaire' },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'member',
                description: 'member',
                name_localizations: { fr: 'membre' },
                description_localizations: { fr: 'membre' }
            }
        ]
    },
    messageCommand: {
        style: 'flat',
        aliases: ['b', 'bank', 'bal'],
    },
    access: {
        guild: {
            modules: {
                economy: { isEnabled: true }
            }
        }
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
