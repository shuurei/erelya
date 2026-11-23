import { Command } from '@/structures/Command'
import { EmbedUI } from '@/ui/EmbedUI'
import { AuraBiomeService } from '@/database/services/aura-biome.service'
import { formatAuraChance } from '@/utils/aura'

const buildPayload = async () => {
    const current = await AuraBiomeService.current();
    const boosted = current.multiplier > 1 ? current.auras : [];
    const rarest = [...boosted].sort((a, b) => {
        const first = BigInt(a.chance);
        const second = BigInt(b.chance);
        return first > second ? -1 : first < second ? 1 : a.id - b.id;
    }).slice(0, 5);

    const changesAt = Math.floor(current.changesAt / 1000);
    const medals = ['🥇', '🥈', '🥉', '💎', '💎'];

    return EmbedUI.createMessage({
        color: 'indigo',
        title: `🌍 ${current.name} - Biome actuel`,
        description: `> *${current.description}*`,
        fields: [
            { name: '🍀 Bonus de biome', value: `**x${current.multiplier.toLocaleString('en')}**`, inline: true },
            { name: '⏳ Prochaine rotation', value: `<t:${changesAt}:t> <t:${changesAt}:R>`, inline: true },
            {
                name: '✨ Auras boostées',
                value: rarest.map((aura, index) => [
                    `- ${medals[index]} **#${aura.id}** • \`${aura.name}\``,
                    `> *Rareté ${formatAuraChance(aura.chance)}*`
                ].join('\n')).join('\n')
            }
        ]
    });
}

export default new Command({
    description: '🌍 Affiche le biome global et ses 5 auras boostées les plus rares',
    access: {
        guild: { modules: { economy: { isEnabled: true } } }
    },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return interaction.editReply({ embeds: [await buildPayload()] });
    },
    async onMessage(message) { return message.reply({ embeds: [await buildPayload()] }); }
});
