import { ApplicationCommandOptionType, ComponentType, Message, MessageFlags, MessageCreateOptions, bold } from 'discord.js'
import { Command } from '@/structures/Command'
import { AuraService, AuraCollectionSort } from '@/database/services/aura.service'
import { EmbedUI } from '@/ui/EmbedUI'
import { auraError } from '@/ui/aura-error'
import { formatAuraChance } from '@/utils/aura'
import { createActionRow, createButton } from '@/ui/components/common'

async function showCollection(guildId: string, userId: string, sort: AuraCollectionSort, unlockedOnly: boolean, reply: (data: Pick<MessageCreateOptions, 'embeds' | 'components'>) => Promise<Message>) {
    let page = 0;

    const render = async (disabled = false) => {
        const result = await AuraService.collection(guildId, userId, page, sort, unlockedOnly);
        const { auras, owned, pages } = result;

        page = result.page;

        return {
            embeds: [EmbedUI.createMessage({
                color: 'indigo',
                title: `✨ Collection d'auras`,
                description: `Pour débloqué des **auras** faites \`/aura roll\` :)`,
                fields: auras.map((aura) => owned.has(aura.id) ? {
                    name: `✨ #${aura.id} • ${aura.name} x${owned.get(aura.id) ?? 0}`,
                    value: [
                        `- Rareté ${formatAuraChance(aura.chance)}`,
                        aura.biome && `- Biome \`${aura.biome.name}\``,
                        `> *${aura.description}*`,
                    ].filter(Boolean).join('\n')
                } : { name: `🔒 #${aura.id} • ???`, value: ' ' }),
                footer: { text: `Page ${page}/${pages}` }
            })],
            components: disabled ? [] : [
                createActionRow([
                    createButton('◀', 'aura_previous', { disabled: disabled || page <= 1 }),
                    createButton('▶', 'aura_next', { disabled: disabled || page >= pages })
                ])
            ]
        };
    }

    const message = await reply(await render());
    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30_000
    });

    collector.on('collect', async (interaction) => {
        collector.resetTimer();

        try {
            if (interaction.user.id !== userId) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                return await interaction.editReply(await auraError('Ouvrez votre propre collection pour la parcourir.'));
            }

            await interaction.deferUpdate();
            page += interaction.customId === 'aura_next' ? 1 : -1;
            await interaction.editReply(await render(collector.ended));
        } catch (err) {
            console.error(err);
        }
    });

    collector.on('end', async () => {
        return await message.edit(await render(true));
    });

    return message;
}

export default new Command({
    description: '📚 Parcourt votre collection avec des flèches et un tri',
    access: { guild: { modules: { economy: {} } } },
    slashCommand: {
        arguments: [
            {
                name: 'unlocked',
                name_localizations: { fr: 'débloqué' },
                description: 'Afficher uniquement les auras déjà débloquées',
                type: ApplicationCommandOptionType.Boolean
            },
            {
                name: 'sort',
                name_localizations: { fr: 'trié' },
                description: 'Ordre des auras',
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: 'Normal', value: 'normal' },
                    { name: 'Rarest', value: 'rarest' }
                ]
            }
        ]
    },
    messageCommand: { aliases: ['auras'] },
    async onInteraction(interaction) {
        await interaction.deferReply();

        return showCollection(
            interaction.guildId,
            interaction.user.id,
            (interaction.options.getString('sort') ?? 'normal') as AuraCollectionSort,
            interaction.options.getBoolean('unlocked') ?? false,
            (data) => interaction.editReply(data)
        );
    },
    async onMessage(message, { args }) {
        const sort = args.some(arg => arg?.toLowerCase() === 'rarest') ? 'rarest' : 'normal';

        return showCollection(
            message.guildId,
            message.author.id,
            sort,
            args.includes('unlocked'),
            (data) => message.reply(data)
        );
    }
});
