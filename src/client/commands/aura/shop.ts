import { APIComponentInContainer, ComponentType, Guild, Message, MessageFlags } from 'discord.js'
import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { GuildMemberService } from '@/database/services/guild-member.service'
import { ContainerUI } from '@/ui'
import { createActionRow, createButton, createSection, createSeparator, createStringSelectMenu, createTextDisplay, createThumbnail } from '@/ui/components/common'
import { auraError } from '@/ui/aura-error'
import { LUCK_POTIONS, LuckPotion } from '@/utils/aura'
import { getDominantColor } from '@/utils'

const ITEMS_PER_PAGE = 3;
const ITEMS = Object.entries(LUCK_POTIONS) as [LuckPotion, (typeof LUCK_POTIONS)[LuckPotion]][];

const ERRORS = {
    active: 'Une potion est déjà active.',
    funds: "Vous n'avez pas assez de pièces sur ce serveur.",
    weekly: `Quota hebdomadaire atteint : ${LUCK_POTIONS.godly.name} (5 achats).`,
    monthly: `Quota mensuel atteint : ${LUCK_POTIONS.monthly.name} (3 achats).`
};

async function openShop(guild: Guild, userId: string, reply: (data: { components: ReturnType<typeof ContainerUI.create>[]; flags: MessageFlags.IsComponentsV2; allowedMentions: { parse: [] } }) => Promise<Message>) {
    const icon = guild.iconURL();
    const color = icon ? await getDominantColor(icon) : undefined;
    const pages = Math.max(1, Math.ceil(ITEMS.length / ITEMS_PER_PAGE));

    let page = 0;

    async function render(closed = false) {
        if (closed) {
            return {
                components: [ContainerUI.createMessage({
                    color: 'orange',
                    title: 'Fermeture automatique',
                    message: 'La boutique a été fermée après une période d’inactivité'
                })]
            };
        }

        const [member, status] = await Promise.all([
            GuildMemberService.findById({ guildId: guild.id, userId }),
            AuraService.luckStatus(guild.id, userId)
        ]);

        const coins = member?.coins ?? 0;
        const components: APIComponentInContainer[] = [];

        const header = [
            createTextDisplay(`## 🧪 Boutique de potions`),
            createTextDisplay('> *Dépensez vos pièces de serveur pour améliorer la chance de vos prochains tirages*')
        ];

        if (icon) {
            components.push(createSection({ accessory: createThumbnail({ url: icon }), components: header }));
        } else {
            components.push(...header);
        }

        components.push(
            createSeparator(),
            createTextDisplay([
                `🪙 Pièces de serveur **${coins.toLocaleString('fr-FR')}**`,
                `🍀 Chance actuelle **${status.luckPercent.toLocaleString('fr-FR')} %**`,
                `✨ ${LUCK_POTIONS.godly.name} **\`${status.godlyRemaining}\`** / **\`5\`** achats restants`,
                `🌙 ${LUCK_POTIONS.monthly.name} **\`${status.monthlyRemaining}\`** / **\`3\`** achats restants`
            ].join('\n')),
            createSeparator()
        );

        const items = ITEMS.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

        components.push(createTextDisplay(items.map(([key, potion]) => [
            `### 🧪 ${potion.name}`,
            `**↳** 🍀 Chance **+${potion.bonusPercent.toLocaleString('fr-FR')} %**`,
            `**↳** ⏳ Durée **x${potion.rolls.toLocaleString('fr-FR')}** tirage${potion.rolls > 1 ? 's' : ''}`,
            `**↳** 🏷️ Prix **${potion.price.toLocaleString('fr-FR')} pièces**`,
            key === 'godly'
                ? `**↳** 📦 Disponibilité **${status.godlyRemaining}/5 cette semaine**`
                : key === 'monthly' && `**↳** 📦 Disponibilité **${status.monthlyRemaining}/3 ce mois-ci**`
        ].filter(Boolean).join('\n')).join('\n')));

        components.push(
            createSeparator(),
            createTextDisplay(`> 💡 *Achat et consommation immédiats*`),
            createActionRow([createStringSelectMenu({
                customId: 'aura_select_potion',
                placeholder: 'Choisissez une potion à acheter',
                options: items.map(([key, potion]) => ({
                    label: potion.name,
                    value: key,
                    emoji: '🧪'
                }))
            })]),
            createActionRow([
                ...(pages > 1 ? [
                    createButton('Précédent', { color: 'gray', customId: 'aura_shop_previous', disabled: page === 0 }),
                    createButton(`${page + 1} / ${pages}`, { color: 'gray', customId: 'aura_shop_page', disabled: true }),
                    createButton('Suivant', { color: 'gray', customId: 'aura_shop_next', disabled: page >= pages - 1 })
                ] : [])
            ])
        );

        return { components: [ContainerUI.create({ color, components })] };
    }

    const message = await reply({ ...await render(), flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    const collector = message.createMessageComponentCollector({ idle: 60_000, time: 600_000 });

    collector.on('collect', async interaction => {
        try {
            if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
            if (interaction.user.id !== userId) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                return await interaction.editReply(await auraError('Ouvrez votre propre boutique avec `/aura shop`'));
            }

            if (interaction.customId.startsWith('aura_confirm:') || interaction.customId.startsWith('aura_cancel:')) return;
            if (collector.ended) {
                return await interaction.deferUpdate();
            }

            await interaction.deferUpdate();
            const processAction = async () => {
                if (interaction.isStringSelectMenu() && interaction.customId === 'aura_select_potion') {
                    const key = interaction.values[0];
                    if (!Object.hasOwn(LUCK_POTIONS, key)) {
                        return await interaction.followUp({ ...await auraError('Potion inconnue. Aucun achat effectué.'), flags: MessageFlags.Ephemeral });
                    }

                    const potionKey = key as LuckPotion;
                    const potion = LUCK_POTIONS[potionKey];
                    const confirmId = `aura_confirm:${interaction.id}`;
                    const cancelId = `aura_cancel:${interaction.id}`;

                    await interaction.editReply({
                        components: [ContainerUI.createMessage({
                            color: 'orange',
                            title: 'Boutique - Achat',
                            message: [
                                `Souhaitez-vous acheter **${potion.name}** pour **${potion.price.toLocaleString('fr-FR')} pièces de serveur** ?`,
                                `🍀 **+${potion.bonusPercent.toLocaleString('fr-FR')} %** pendant **${potion.rolls} tirage${potion.rolls > 1 ? 's' : ''}**`
                            ].join('\n'),
                            components: [createActionRow([
                                createButton('Confirmer', { color: 'green', customId: confirmId }),
                                createButton('Annuler', { color: 'red', customId: cancelId })
                            ])]
                        })]
                    });

                    const confirm = await message.awaitMessageComponent({
                        componentType: ComponentType.Button,
                        filter: (button) => button.user.id === userId && [confirmId, cancelId].includes(button.customId),
                        time: 15_000
                    }).catch(() => null);

                    if (!confirm) return;
                    await confirm.deferUpdate();

                    if (confirm.customId === cancelId || collector.ended) return;

                    const result = await AuraService.drink(guild.id, userId, potionKey);
                    
                    if (result.error) {
                        await confirm.followUp({
                            ...await auraError(ERRORS[result.error]),
                            flags: MessageFlags.Ephemeral
                        });
                    } else {
                        await confirm.followUp({
                            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                            components: [ContainerUI.createSuccessMessage({
                                title: 'Boutique - Achat réussi',
                                message: [
                                    `La potion **${potion.name}** a été achetée et bue pour **${potion.price.toLocaleString('fr-FR')} pièces** !`,
                                    `Bonus de chance **+${result.bonusPercent.toLocaleString('fr-FR')} %** pour vos **\`${result.rollsRemaining}\`** prochains rolls !`
                                ].join('\n')
                            })]
                        });
                    }
                } else if (interaction.customId === 'aura_shop_next') {
                    page = Math.min(pages - 1, page + 1);
                } else if (interaction.customId === 'aura_shop_previous') {
                    page = Math.max(0, page - 1);
                }
            };

            await processAction();
            await message.edit(await render(collector.ended));
        } catch (error) {
            console.error(error);
            if (interaction.user.id === userId) {
                collector.stop('error');
                await interaction.followUp({
                    ...await auraError('Display Error'),
                    flags: MessageFlags.Ephemeral
                }).catch(() => { });
            }
        } finally {
            if (collector.ended) {
                await message.edit(await render(true));
            }
        }
    });

    collector.on('end', async () => {
        await message.edit(await render(true));
    });

    return message;
}

export default new Command({
    description: '🧪 Parcourt la boutique des potions et confirme vos achats',
    access: {
        guild: { modules: { economy: { isEnabled: true } } }
    },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return openShop(interaction.guild, interaction.user.id, data => interaction.editReply(data));
    },
    async onMessage(message) {
        return openShop(message.guild, message.author.id, data => message.reply(data));
    }
});
