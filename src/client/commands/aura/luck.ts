import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { EmbedUI } from '@/ui/EmbedUI'

async function luck(guildId: string, userId: string) {
    const status = await AuraService.luckStatus(guildId, userId);

    return EmbedUI.createMessage({
        color: 'green',
        title: `🍀 Chance total x${status.luck.toLocaleString('fr-FR')}`,
        description: [
            `🧤 Bonus des gants **x${status.permanentLuck}**`,
            `🧪 Bonus des potions **x${status.potionLuck}**`
        ].join('\n')
    });
}

export default new Command({
    description: '🍀 Consulte votre luck et vos charges de potion',
    access: {
        guild: { modules: { economy: { isEnabled: true } } }
    },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return interaction.editReply({ embeds: [await luck(interaction.guildId, interaction.user.id)] });
    },
    async onMessage(message) {
        return message.reply({ embeds: [await luck(message.guildId, message.author.id)] });
    }
});
