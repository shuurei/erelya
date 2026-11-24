import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { EmbedUI } from '@/ui/EmbedUI'
import { auraError } from '@/ui/aura-error'
import { AURA_ROLL_LIMIT, formatAuraChance } from '@/utils/aura'

const buildPayload = async (guildId: string, userId: string) => {
    const result = await AuraService.roll(guildId, userId);
    if (!result.aura) {
        return auraError(`Vos 10 tirages sont utilisés. Vous devez attendre la prochaine heure.`);
    }

    return {
        embeds: [EmbedUI.createMessage({
            color: result.isNew ? 'yellow' : 'indigo',
            title: `✨ ${result.aura.name} ${result.isNew ? '[NEW]' : `[${result.count - 1} en stock]`}`,
            description: [
                ...(result.bonusRoll ? ['🍀 **10éme tirage : chance de base doublée !**'] : []),
                `${formatAuraChance(result.aura.chance)} • Chance du tirage **${(result.luckPercent / 100).toLocaleString('en')}**`,
                `> *${result.aura.description}*`,
            ].join('\n'),
            footer: { text: `${result.remaining}/${AURA_ROLL_LIMIT} tirages restants` }
        })]
    };
}

export default new Command({
    description: '✨ 10 tirages gratuits par heure, chance de base doublée au 10ᵉ',
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
