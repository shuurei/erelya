import { Command } from '@/structures'
import { ApplicationCommandOptionType, GuildMember, MessageFlags } from 'discord.js'
import { DateTime } from 'luxon'

import { GuildMemberService } from '@/database/services/guild-member.service'
import { RaffleContributorService } from '@/database/services/raffle-contributor.service'

import { createSection, createTextDisplay, createThumbnail } from '@/ui/components/common'
import { createNotifCard } from '@/ui/assets/cards/notifCard'
import { ContainerUI } from '@/ui'

import { guildMemberHelper } from '@/helpers'
import { formatTimeLeft } from '@/utils'

const MIN_BET = 5000;
const MAX_BET = 50000;
const MIN_PARTICIPANTS = 5;

const getNextDraw = () => {
    const now = DateTime.now().setZone('Europe/Paris');
    const nextDraw = now.startOf('week').plus({ weeks: 1 });

    return { now, nextDraw };
};

const buildPayload = async (member: GuildMember, amount?: number) => {
    if (amount) {
        const contributionWeek = DateTime.now().setZone('Europe/Paris').startOf('week').toISODate();
        const contributor = await RaffleContributorService.findById({ userId: member.id });
        if (contributor && (contributor.contributionWeek.toString() == contributionWeek)) {
            return {
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `Vous avez déjà participer à la cagnotte cette semaine.`,
                            theme: 'red'
                        }),
                        name: 'failure.png'
                    }
                ]
            } as const;
        }

        if ((amount < MIN_BET || amount > MAX_BET)) {
            return {
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `Ta mise doit être comprise entre ${MIN_BET.toLocaleString('en')} et ${MAX_BET.toLocaleString('en')} pièces.`,
                            theme: 'red'
                        }),
                        name: 'failure.png'
                    }
                ]
            } as const;
        }

        const { coins } = await GuildMemberService.findOrCreate({ guildId: member.guild.id, userId: member.id });
        if (coins < amount) {
            return {
                files: [
                    {
                        attachment: await createNotifCard({
                            text: `Vous n'avez pas assez de pièce pour participer avec cette somme.`,
                            theme: 'red'
                        }),
                        name: 'failure.png'
                    }
                ]
            } as const;
        }

        await Promise.all([
            RaffleContributorService.joinRaffle({ userId: member.id, guildId: member.guild.id }, (contributor?.coins ?? 0) + amount),
            GuildMemberService.removeCoins({ userId: member.id, guildId: member.guild.id }, amount)
        ]);
    }

    const memberHelper = await guildMemberHelper(member, { fetchAll: true });

    const [total, count, ownContribution] = await Promise.all([
        RaffleContributorService.getTotalCoins(),
        RaffleContributorService.count(),
        RaffleContributorService.findById({ userId: member.id })
    ]);

    const statusText = count < MIN_PARTICIPANTS
        ? `- ❌ Le tirage nécessite au moins **${MIN_PARTICIPANTS.toLocaleString('en')} participants**. Si ce seuil n'est pas atteint, la cagnotte est reportée !`
        : `- ✅ **${count.toLocaleString('en')} participants** sont inscrits. Le tirage aura lieu dimanche soir !`;

    const { now, nextDraw } = getNextDraw();
    const timeLeft = formatTimeLeft(nextDraw.toMillis(), { now: now.toMillis() });

    return {
        flags: MessageFlags.IsComponentsV2,
        components: [
            ContainerUI.create({
                components: [
                    createSection({
                        accessory: createThumbnail({ url: memberHelper.getAvatarURL() }),
                        components: [
                            createTextDisplay('## 🎟️ Cagnotte'),
                            createTextDisplay(`*Participe avec une mise de **${MIN_BET.toLocaleString('en')}** à **${MAX_BET.toLocaleString('en')} pièces**. Chaque participant dispose d’une chance égale de gagner, quel que soit le montant investi*`)
                        ]
                    }),
                    createTextDisplay([
                        '### ⏳ Condition du tirage',
                        `- 🕐 **${timeLeft}** avant le tirage`,
                        statusText,
                        '### :coin: Cagnotte',
                        `> **${total.toLocaleString('en')} pièces**`,
                        '### 👥 Participants',
                        `> **${count}**`,
                        '### 🙋 Ta participation',
                        `> **${ownContribution ? ownContribution.coins.toLocaleString('en') : 0}** pièces`,
                    ].join('\n'))
                ]
            })
        ]
    } as const;
};

export default new Command({
    nameLocalizations: {
        fr: 'cagnotte'
    },
    description: '🎟️ View or join the global raffle',
    descriptionLocalizations: {
        fr: '🎟️ Consulte ou participe à la cagnotte globale'
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.Integer,
                name: 'amount',
                description: `Amount to bet between ${MIN_BET} and ${MAX_BET}`,
                name_localizations: { fr: 'mise' },
                description_localizations: { fr: `Montant à miser entre ${MIN_BET} et ${MAX_BET}` },
                required: false,
                min_value: MIN_BET,
                max_value: MAX_BET
            }
        ]
    },
    messageCommand: {
        style: 'flat',
        aliases: ['r', 'cagnotte']
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

        return await interaction.editReply(await buildPayload(interaction.member));
    },
    async onMessage(message, { args: [amount] }) {
        return await message.reply(await buildPayload(message.member!, amount ? Number(amount) : undefined));
    }
});
