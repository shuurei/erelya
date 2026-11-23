import { ApplicationCommandOptionType } from 'discord.js'
import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { EmbedUI } from '@/ui/EmbedUI'
import { auraError } from '@/ui/aura-error'

const equip = async (guildId: string, userId: string, auraId: number) => {
    if (!Number.isSafeInteger(auraId) || auraId < 1 || auraId > 2147483647) {
        return auraError("La commande est /aura equip <ID de l'aura");
    }

    const aura = await AuraService.equip(guildId, userId, auraId);
    return aura
        ? { embeds: [EmbedUI.createMessage(`✨ **${aura.name}** est maintenant affichée sur votre profil de ce serveur`, { color: 'green' })] }
        : auraError('Vous ne possédez pas cette aura sur ce serveur.');
}

export default new Command({
    description: '✨ Équipe une aura possédée sur ce serveur pour votre profil',
    access: {
        guild: { modules: { economy: { isEnabled: true } } }
    },
    slashCommand: {
        arguments: [{
            name: 'id',
            description: 'ID de l’aura à équiper',
            type: ApplicationCommandOptionType.Integer,
            required: true
        }]
    },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return interaction.editReply(await equip(interaction.guildId, interaction.user.id, interaction.options.getInteger('id', true)));
    },
    async onMessage(message, { args }) {
        return message.reply(await equip(message.guildId, message.author.id, Number(args[0])));
    }
});
