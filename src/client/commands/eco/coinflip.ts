import { GuildMember, MessageFlags } from 'discord.js'
import { Command } from '@/structures/Command'

import { createNotifCard } from '@/ui/assets/cards/notifCard'
import { createMediaGallery } from '@/ui/components/common'
import { GuildMemberService } from '@/database/services/guild-member.service'

const MIN_BET = 100;
const MAX_BET = 1_000_000;
const BET_STEP = 100_000;

const parseBet = (input: string, coins: number): number | null => {
    const value = input.trim().toLowerCase()

    if (value === 'max') {
        return Math.min(coins, MAX_BET)
    }

    const percentageMatch = value.match(/^(\d+(?:[.,]\d+)?)%$/);

    if (percentageMatch) {
        const percentage = Number(percentageMatch[1].replace(',', '.'));

        if (percentage <= 0 || percentage > 100) {
            return null
        }

        return Math.floor(Math.min(coins, MAX_BET) * percentage / 100);
    }

    const amount = Number(value);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
        return null
    }

    return amount
}

const getWinChance = (amount: number): number => {
    const steps = Math.floor((amount - 1) / BET_STEP)

    return Math.max(0.05, 0.5 - steps * 0.05)
}

const handleCommand = async ({ amount: input, guildId, member }: {
    amount: string;
    guildId: string;
    member: GuildMember;
}) => {
    const { coins } = await GuildMemberService.findById({ guildId, userId: member.id }) ?? { coins: 0 }
    const amount = parseBet(input, coins);

    if (amount === null) {
        return [
            {
                attachment: await createNotifCard({
                    text: '[Mise invalide. Utilisez un montant, max ou un pourcentage entre 1% et 100%.]',
                    theme: 'red'
                }),
                name: 'failure.png'
            }
        ]
    }

    if (amount < MIN_BET) {
        return [
            {
                attachment: await createNotifCard({
                    text: `[La mise minimale est de ${MIN_BET.toLocaleString('en')} pièces.]`,
                    theme: 'red'
                }),
                name: 'failure.png'
            }
        ]
    }

    if (amount > MAX_BET) {
        return [
            {
                attachment: await createNotifCard({
                    text: `[La mise maximale est de ${MAX_BET.toLocaleString('en')} pièces.]`,
                    theme: 'red'
                }),
                name: 'failure.png'
            }
        ]
    }

    if (coins < amount) {
        return [
            {
                attachment: await createNotifCard({
                    text: "[Vous n'avez pas assez d'argent pour parier.]",
                    theme: 'red'
                }),
                name: 'failure.png'
            }
        ]
    }

    const winChance = getWinChance(amount);
    const win = Math.random() < winChance;

    if (win) {
        await GuildMemberService.addCoins({ guildId, userId: member.id }, amount);

        return [
            {
                attachment: await createNotifCard({
                    text: `[Vous avez doublé votre mise ! Vous avez gagné ${amount.toLocaleString('en')} pièces avec une chance de ${Math.round(winChance * 100)}%]`,
                    theme: 'green'
                }),
                name: 'success.png'
            },
            {
                attachment: await createNotifCard({
                    text: `[Nouveau solde : ${(coins + amount).toLocaleString('en')} pièces.]`
                }),
                name: 'newBalance.png'
            }
        ]
    }

    await GuildMemberService.removeCoins(
        { guildId, userId: member.id },
        amount
    )

    return [
        {
            attachment: await createNotifCard({
                text: `[Vous avez perdu votre mise de ${amount.toLocaleString('en')} pièces avec une chance de ${Math.round(winChance * 100)}%]`,
                theme: 'red'
            }),
            name: 'failure.png'
        },
        {
            attachment: await createNotifCard({
                text: `[Nouveau solde : ${(coins - amount).toLocaleString('en')} pièces.]`
            }),
            name: 'newBalance.png'
        }
    ]
}

export default new Command({
    description: '🎰 Execute a coin flip to wager guild coins',
    descriptionLocalizations: {
        fr: '🎰 Lancez une pièce pour miser des pièces du serveur'
    },
    slashCommand: {
        arguments: [
            {
                type: 3,
                name: 'amount',
                description: 'Amount to wager, max, or a percentage (e.g. 50%)',
                description_localizations: {
                    fr: 'Montant à miser, max ou pourcentage (ex. 50%)'
                },
                required: true
            }
        ]
    },
    messageCommand: { style: 'flat' },
    access: {
        guild: {
            modules: {
                economy: { isGamblingEnabled: true }
            }
        }
    },
    async onInteraction(interaction) {
        await interaction.deferReply()

        const files = await handleCommand({
            amount: interaction.options.getString('amount', true),
            guildId: interaction.guild!.id,
            member: interaction.member as GuildMember
        })

        return await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            files,
            components: files.map((file) =>
                createMediaGallery([
                    { media: { url: `attachment://${file.name}` } }
                ])
            )
        })
    },
    async onMessage(message, { args: [amount] }) {
        const files = await handleCommand({
            amount: String(amount),
            guildId: message.guild!.id,
            member: message.member!
        })

        return await message.reply({
            flags: MessageFlags.IsComponentsV2,
            files,
            components: files.map((file) =>
                createMediaGallery([
                    { media: { url: `attachment://${file.name}` } }
                ])
            )
        })
    }
})
