import { ApplicationCommandOptionType } from 'discord.js'
import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { EmbedUI } from '@/ui/EmbedUI'
import { auraError } from '@/ui/aura-error'

const equip = async (guildId: string, userId: string, auraKey: string | null) => {
    const key = auraKey?.trim().toUpperCase();
    if (!key || !/^[A-Z0-9]+$/.test(key)) {
        return auraError('Indiquez la clé de l’aura, par exemple `/aura equip clé:COMMON`.');
    }

    const aura = await AuraService.equip(guildId, userId, key);
    return aura
        ? { embeds: [EmbedUI.createMessage(`✨ **${aura.name}** est maintenant affichée sur votre profil de ce serveur`, { color: 'green' })] }
        : auraError('Vous ne possédez pas cette aura.');
}

export default new Command({
    description: '✨ Équipe une aura de votre collection pour votre profil sur ce serveur',
    access: {
        guild: { modules: { economy: { isEnabled: true } } }
    },
    slashCommand: {
        arguments: [{
            name: 'cle',
            description: 'Clé de l’aura à équiper, par exemple COMMON',
            type: ApplicationCommandOptionType.String,
            required: true
        }]
    },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return interaction.editReply(await equip(interaction.guildId, interaction.user.id, interaction.options.getString('cle', true)));
    },
    async onMessage(message, { args }) {
        return message.reply(await equip(message.guildId, message.author.id, args[0] ?? null));
    }
});
