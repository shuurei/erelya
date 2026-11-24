import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { EmbedUI } from '@/ui/EmbedUI'
import { getAuraEffect } from '@/data/aura-effects'

const format = (value: number) => value.toLocaleString('fr-FR');

async function buildBonusEmbed(guildId: string, userId: string) {
    const status = await AuraService.luckStatus(guildId, userId);
    const aura = status.equippedAura;
    const effect = getAuraEffect(aura?.key);

    return EmbedUI.createMessage({
        color: 'green',
        title: '🍀 Bonus d’aura',
        description: `**Luck totale : ${format(status.luckPercent / 100)}** (${format(status.luckPercent)} % avant les bonus de tirage)`,
        fields: [
            { name: '🧤 Gants', value: `**+${format(status.gloveBonusPercent)} %**`, inline: true },
            {
                name: '🧪 Potion active',
                value: status.rollsRemaining > 0
                    ? `**+${format(status.potionBonusPercent)} %** · ${status.rollsRemaining} tirage(s) restant(s)`
                    : 'Aucune potion active',
                inline: true
            },
            {
                name: '✨ Effets spéciaux',
                value: aura && effect
                    ? `**${aura.name}** · Mise maximale de **${format(effect.coinflipMaxBet)} pièces** au coinflip.`
                    : aura ? `**${aura.name}** · Aucun effet spécial.` : 'Aucune aura équipée sur ce serveur.'
            }
        ]
    });
}

export default new Command({
    description: '🍀 Consultez votre luck, vos potions et les effets de votre aura équipée',
    access: {
        guild: { modules: { economy: { isEnabled: true } } }
    },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return interaction.editReply({ embeds: [await buildBonusEmbed(interaction.guildId, interaction.user.id)] });
    },
    async onMessage(message) {
        return message.reply({ embeds: [await buildBonusEmbed(message.guildId, message.author.id)] });
    }
});
