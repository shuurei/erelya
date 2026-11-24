import { APIComponentInContainer, ComponentType, Message, MessageFlags } from 'discord.js'
import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { AURA_GLOVES } from '@/utils/aura-gloves'
import { ContainerUI } from '@/ui'
import { auraError } from '@/ui/aura-error'
import { createActionRow, createButton, createSection, createSeparator, createTextDisplay } from '@/ui/components/common'

const PER_PAGE = 3;
type GlovePayload = {
    components: ReturnType<typeof ContainerUI.create>[];
    flags: MessageFlags.IsComponentsV2;
    allowedMentions: { parse: [] };
};

const gloves = async (guildId: string, userId: string, reply: (data: GlovePayload) => Promise<Message>) => {
    const pages = Math.max(1, Math.ceil(AURA_GLOVES.length / PER_PAGE));
    const initial = await AuraService.gloves(guildId, userId);
    let page = Math.min(pages, Math.floor(initial.level / PER_PAGE) + 1);

    const render = async (disabled = false) => {
        const status = await AuraService.gloves(guildId, userId);
        const start = (page - 1) * PER_PAGE;
        const components: APIComponentInContainer[] = [
            createTextDisplay('## 🧤 Atelier des gants'),
            createTextDisplay(`> *Les gants se fabriquent dans l’ordre, les ingrédients sont consommés, mais les auras restent découvertes, le bonus se cumule avec les potions et le biome ! :)*`),
            createSeparator()
        ];

        for (const [index, glove] of AURA_GLOVES.slice(start, start + PER_PAGE).entries()) {
            const tier = start + index;
            const isNext = tier === status.level;
            const obtained = tier < status.level;
            const ingredients = Object.entries(glove.recipe);
            const canCraft = isNext && ingredients.every(([name, amount]) => (status.counts.get(name) ?? 0) >= amount);

            const details = [
                createTextDisplay(`### ${obtained ? '✅' : isNext ? '🔨' : '🔒'} ${glove.name} • +${glove.luckBonusPercent.toLocaleString('fr-FR')} % de chance`),
                createTextDisplay(isNext
                    ? ingredients.map(([name, amount]) => `${(status.counts.get(name) ?? 0) >= amount ? '✅' : '❌'} \`${name}\` **${status.counts.get(name) ?? 0}/${amount}**`).join('\n')
                    : obtained ? '*Gant déjà fabriqué*' : '*Fabriquez le palier précédent pour débloquer ce gant*')
            ];

            if (disabled) {
                components.push(...details);
            } else {
                components.push(createSection({
                    components: details,
                    accessory: createButton(isNext ? 'Fabriquer' : obtained ? 'Obtenu' : 'Verrouillé', {
                        customId: `gloves_craft:${glove.key}`,
                        color: isNext ? 'green' : 'gray',
                        disabled: !canCraft
                    })
                }));
            }
            components.push(createSeparator());
        }

        
        if (!disabled) {
            components.push(createActionRow([
                createButton('◀', 'gloves_previous', { disabled: page <= 1 }),
                createButton('▶', 'gloves_next', { disabled: page >= pages })
            ]));
        }
        
        components.push(createTextDisplay(`-# Page ${page}/${pages}`));

        return { components: [ContainerUI.create({ color: 'indigo', components })] };
    };

    const message = await reply({ ...await render(), flags: MessageFlags.IsComponentsV2, allowedMentions: { parse: [] } });
    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300_000 });

    collector.on('collect', async interaction => {
        try {
            if (interaction.user.id !== userId) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                return await interaction.editReply(await auraError('Vous ne pouvez pas agir sur cette page'));
            }

            await interaction.deferUpdate();
            
            if (!collector.ended) {
                if (interaction.customId === 'gloves_next') {
                    page = Math.min(pages, page + 1);
                } else if (interaction.customId === 'gloves_previous') {
                    page = Math.max(1, page - 1);
                } else if (interaction.customId.startsWith('gloves_craft:')) {
                    const key = interaction.customId.slice('gloves_craft:'.length);
                    const result = await AuraService.craftGlove(guildId, userId, key);

                    if (result.error) {
                        const errors = {
                            unknown: 'Gant inconnu',
                            tier: 'Ce gant est déjà fabriqué ou nécessite le palier précédent',
                            ingredients: 'Vous ne possédez pas assez d’exemplaires des auras nécessaires'
                        };

                        await interaction.followUp({ ...await auraError(errors[result.error]), flags: MessageFlags.Ephemeral });
                    } else {
                        const level = AURA_GLOVES.findIndex((glove) => glove.key === key) + 1;
                        page = Math.min(pages, Math.floor(level / PER_PAGE) + 1);

                        await interaction.followUp({
                            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                            components: [ContainerUI.createSuccessMessage({
                                title: '🧤 Gant fabriqué',
                                message: `**${result.glove.name}** est maintenant équipé !`
                            })]
                        });
                    }
                }

                await interaction.editReply(await render(collector.ended));
            }

            if (collector.ended) {
                await message.edit(await render(true));
            }
        } catch (error) {
            console.error(error);
            if (interaction.user.id === userId) {
                collector.stop('error');
            }
        }
    });

    collector.on('end', async () => {
        try {
            await message.edit(await render(true));
        } catch (error) {
            console.error(error);
        }
    });
    
    return message;
};

export default new Command({
    description: '🧤 Parcourt les gants et fabrique le prochain palier avec vos auras',
    access: { guild: { modules: { economy: {} } } },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return gloves(interaction.guildId, interaction.user.id, data => interaction.editReply(data));
    },
    async onMessage(message) {
        return gloves(message.guildId, message.author.id, data => message.reply(data));
    }
});
