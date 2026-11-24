import { Command } from '@/structures/Command'
import { AuraService } from '@/database/services/aura.service'
import { createNotifCard } from '@/ui/assets/cards/notifCard'
import { parseUserMention } from '@/utils/discord'
import { notificationError } from '@/ui/notification-error'

export default new Command({
    description: 'Attribue une aura du catalogue à un membre de ce serveur',
    access: { user: { isDeveloper: true } },
    async onMessage(message, { args: [target, auraName] }) {
        const userId = parseUserMention(target) ?? target;
        const key = auraName?.toUpperCase().replace(/^\[(.+)\]$/, '$1');
        if (!userId || !key) {
            return message.reply(await notificationError(`Utilisation : ${process.env.PREFIX}debug aura give <membre> <clé de l’aura>`));
        }

        const member = message.guild.members.cache.get(userId) ?? await message.guild.members.fetch(userId).catch(() => null);
        if (!member || member.user.bot) {
            return message.reply(await notificationError('Choisis un membre humain de ce serveur.'));
        }

        const result = await AuraService.grant(message.guildId, userId, key);
        if (result.error) {
            return message.reply(await notificationError(result.error === 'owned' ? 'Ce membre possède déjà cette aura spéciale sur son compte.' : 'Clé d’aura inconnue.'));
        }

        const scope = result.aura.chance === null ? 'sur tous tes serveurs' : `sur **${message.guild.name}**`;
        let notificationSent = false;
        try {
            await member.user.send({
                content: `Tu as reçu l’aura **${result.aura.name}** ${scope}. Tu peux l’équiper avec \`/aura equip cle:${result.aura.key}\`.`,
                files: [{
                    attachment: await createNotifCard({ text: `Aura reçue\n${result.aura.name}`, theme: 'purple' }),
                    name: 'aura-notification.png'
                }]
            });

            notificationSent = true;
        } catch (err) {
            console.log(err)
        }

        return message.reply({
            content: `✨ Aura **${result.aura.name}** (\`${result.aura.key}\`) attribuée à <@${userId}>. ${notificationSent ? 'Notification envoyée en MP !' : 'Impossible d’envoyer la notification en MP..'}`,
            allowedMentions: { parse: [], repliedUser: false }
        });
    }
});
