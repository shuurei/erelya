import { GuildMember, MessageFlags } from 'discord.js'
import { Command } from '@/structures/Command'

import { createNotifCard } from '@/ui/assets/cards/notifCard'
import { createMediaGallery } from '@/ui/components/common'
import { GuildMemberService } from '@/database/services/guild-member.service';

const MIN_BET = 100;
const MAX_BET = 100_000;

const handleCommand = async ({ amount, guildId, member }: {
    amount: number | 'max';
    guildId: string;
    member: GuildMember;
}) => {
    const { coins } = await GuildMemberService.findById({ guildId, userId: member.id }) ?? { coins: 0 };

    if (typeof amount === 'string' && amount === 'max') {
        amount = Math.min(coins, MAX_BET);
    }

    amount = +amount;

    if (isNaN(amount)) {
        return [
            {
                attachment: await createNotifCard({
                    text: "[Chiffre invalide.]",
                    theme: 'red'
                }),
                name: 'failure.png'
            }
        ];
    }

    if (amount < MIN_BET) {
        return [
            {
                attachment: await createNotifCard({
                    text: `[La Mise minimale est de ${MIN_BET.toLocaleString('en')} pièces.]`,
                    theme: 'red'
                }),
                name: 'failure.png'
            }
        ];
    }

    if (amount > MAX_BET) {
        return [
            {
                attachment: await createNotifCard({
                    text: `[La Mise maximale est de ${MAX_BET.toLocaleString('en')} pièces.]`,
                    theme: 'red'
                }),
                name: 'failure.png'
            }
        ];
    }

    if (coins < amount) {
        return [
            {
                attachment: await createNotifCard({
                    text: `[Vous n'avez pas assez d'argent pour parier.]`,
                    theme: 'red'
                }),
                name: 'failure.png'
            }
        ];
    }

    const win = Math.random() < 0.5;
    if (win) {
        await GuildMemberService.addCoins({ guildId, userId: member.id }, amount);

        return [
            {
                attachment: await createNotifCard({
                    text: `[Vous avez doublé votre mise. Vous avez gagné ${amount.toLocaleString('en')} de pièces.]`,
                    theme: 'green'
                }),
                name: 'success.png'
            },
            {
                attachment: await createNotifCard({
                    text: `[Nouveau solde : ${(coins + amount).toLocaleString('en')} pièces.]`,
                }),
                name: 'newBalance.png'
            }
        ];
    }

    await GuildMemberService.removeCoins({ guildId, userId: member.id }, amount);

    return [
        {
            attachment: await createNotifCard({
                text: `[Vous avez perdu votre mise. Vous avez perdu ${amount.toLocaleString('en')} de pièces.]`,
                theme: 'red'
            }),
            name: 'failure.png'
        },
        {
            attachment: await createNotifCard({
                text: `[Nouveau solde : ${(coins - amount).toLocaleString('en')} pièces.]`,
            }),
            name: 'newBalance.png'
        }
    ];
}

export default new Command({
    description: '🎰 Execute a coin flip to wager guild coins',
    descriptionLocalizations: { fr: '🎰 Lancez une pièce pour miser des pièces du serveur' },
    slashCommand: {
        arguments: [
            {
                type: 3,
                name: 'amount',
                description: 'The amount to wager or " max "',
                description_localizations: {
                    fr: 'Le montant à miser ou " max "'
                },
                required: true
            }
        ]
    },
    messageCommand: { style: 'flat' },
    access: {
        guild: {
            modules: { economy: { isGamblingEnabled: true } }
        }
    },
    async onInteraction(interaction) {
        await interaction.deferReply();

        const files = await handleCommand({
            amount: interaction.options.getString('amount', true) as 'max',
            guildId: interaction.guild.id,
            member: interaction.member
        });

        return await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            files,
            components: files.map((file) => {
                return createMediaGallery([{ media: { url: `attachment://${file.name}` } }])
            })
        });
    },
    async onMessage(message, { args: [amount] }) {
        const files = await handleCommand({
            amount: amount as 'max',
            guildId: message.guild.id,
            member: message.member!
        });

        return await message.reply({
            flags: MessageFlags.IsComponentsV2,
            files,
            components: files.map((file) => {
                return createMediaGallery([{ media: { url: `attachment://${file.name}` } }])
            })
        });
    }
})
