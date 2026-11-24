import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { parseUserMention } from '@/utils/discord'
import { notificationError } from '@/ui/notification-error'

export default new Command({
    description: 'Retire une aura d’un membre (globale si spéciale)',
    access: { user: { isDeveloper: true } },
    async onMessage(message, { args: [target, auraArg] }) {
        const userId = parseUserMention(target) ?? target;
        const key = auraArg?.toUpperCase().replace(/^\[(.+)\]$/, '$1');

        if (!userId || !key || !/^[A-Z0-9]+$/.test(key)) {
            return message.reply(await notificationError(`Utilisation : ${process.env.PREFIX}debug aura remove <membre> <clé de l’aura>`));
        }

        const aura = await AuraService.remove(message.guildId, userId, key);
        if (!aura) return message.reply(await notificationError('Aura inconnue ou absente de la collection.'));

        return message.reply({
            content: aura.chance === null
                ? `L’aura spéciale **${aura.name}** (\`${aura.key}\`) a été retirée à <@${userId}> sur tous les serveurs.`
                : `Toutes les copies de **${aura.name}** (\`${aura.key}\`) ont été retirées à <@${userId}> sur ce serveur.`,
            allowedMentions: { parse: [], repliedUser: false }
        });
    }
});
