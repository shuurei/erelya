import { GuildMember, MessageFlags } from 'discord.js'
import { Command } from '@/structures/Command'

import { createNotifCard } from '@/ui/assets/cards/notifCard'
import { createMediaGallery } from '@/ui/components/common'
import { CoinflipService, COINFLIP_HOURLY_LIMIT, MIN_COINFLIP_BET } from '@/database/services/coinflip.service'

const formatCoins = (amount: number) => amount.toLocaleString('fr-FR');

const handleCommand = async ({ amount: input, guildId, member }: { amount: string; guildId: string; member: GuildMember }) => {
    const result = await CoinflipService.play(guildId, member.id, input);
    if (result.error) {
        const errors = {
            invalid: 'Mise invalide. Utilisez un montant, max ou un pourcentage entre 0 et 100 %.',
            minimum: `La mise minimale est de ${formatCoins(MIN_COINFLIP_BET)} pièces.`,
            maximum: `La mise maximale est de ${formatCoins(result.maxBet ?? 0)} pièces.`,
            funds: 'Vous n’avez pas assez de pièces pour parier.',
            balance: 'Un gain dépasserait le solde maximal. Réduisez votre mise.',
            quota: `Vos ${COINFLIP_HOURLY_LIMIT} coinflips sont utilisés. Réessayez à la prochaine heure.`
        };
        return [{
            attachment: await createNotifCard({ text: `[${errors[result.error]}]`, theme: 'red' }),
            name: 'failure.png'
        }];
    }

    const outcome = result.win
        ? `Vous avez doublé votre mise ! Vous avez gagné ${formatCoins(result.amount)} pièces.`
        : `Vous avez perdu votre mise de ${formatCoins(result.amount)} pièces.`;
    return [
        {
            attachment: await createNotifCard({ text: `[${outcome}]`, theme: result.win ? 'green' : 'red' }),
            name: result.win ? 'success.png' : 'failure.png'
        },
        {
            attachment: await createNotifCard({ text: `[Solde : ${formatCoins(result.balance)} pièces. ${result.remaining}/${COINFLIP_HOURLY_LIMIT} coinflips restants.]` }),
            name: 'newBalance.png'
        }
    ];
};

export default new Command({
    description: '🎰 Wager guild coins in a coin flip (10 per hour)',
    descriptionLocalizations: {
        fr: '🎰 Misez des pièces du serveur (10 coinflips par heure)'
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
