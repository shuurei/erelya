import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { EmbedUI } from '@/ui/EmbedUI'

const payload = () => ({
    embeds: [EmbedUI.createMessage("L'aura a été retirée de votre profil sur ce serveur.", { color: 'green' })]
});

export default new Command({
    description: 'Retire l’aura équipée de votre profil sur ce serveur',
    access: { guild: { modules: { economy: {} } } },
    async onInteraction(interaction) {
        await interaction.deferReply();
        await AuraService.unequip(interaction.guildId, interaction.user.id);

        return interaction.editReply(payload());
    },
    async onMessage(message) {
        await AuraService.unequip(message.guildId, message.author.id);
        
        return message.reply(payload());
    }
});
