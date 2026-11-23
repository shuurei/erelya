import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { EmbedUI } from '@/ui/EmbedUI'
import { auraError } from '@/ui/aura-error'
import { formatAuraChance } from '@/utils/aura'

const buildPayload = async (guildId: string, userId: string) => {
    const result = await AuraService.roll(guildId, userId);
    if (result.error === 'funds') {
        return auraError('Il vous faut 5 000 pièces de serveur.');
    }

    if (!result.aura) {
        return auraError(`Vos 10 tirages sont utilisés. Vous devez attendre la prochaine heure.`);
    }

    return {
        embeds: [EmbedUI.createMessage({
            color: result.isNew ? 'yellow' : 'indigo',
            title: `✨ #${result.aura.id} • ${result.aura.name} ${result.isNew ? '[NEW]' : `[${result.count - 1} en stock]`}`,
            description: [
                `${formatAuraChance(result.aura.chance)} avec une chance de **\`${result.luck.toLocaleString('en')}\`**`,
                `> *${result.aura.description}*`,
            ].join('\n'),
            footer: { text: `${result.remaining}/10 tirages restants` }
        })]
    };
}

export default new Command({
    description: '✨ Roll une aura pour 5 000 pièces, 10 tirages par heure',
    access: {
        guild: { modules: { economy: { isEnabled: true } } }
    },
    messageCommand: { style: 'flat', aliases: ['ar', 'aroll'] },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return interaction.editReply(await buildPayload(interaction.guildId, interaction.user.id));
    },
    async onMessage(message) {
        return message.reply(await buildPayload(message.guildId, message.author.id));
    }
});
