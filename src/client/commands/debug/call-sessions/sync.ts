import { Command } from '@/structures/Command'
import { EmbedUI } from '@/ui/EmbedUI'
import { notificationError } from '@/ui/notification-error'

export default new Command({
    access: {
        user: { isDeveloper: true }
    },
    messageCommand: {
        style: 'slashCommand'
    },
    async onMessage(message, { args: [channelId] }) {
        const channel = channelId
            ? message.guild.channels.cache.get(channelId)
            : message.channel;

        if (!channel?.isVoiceBased()) {
            return message.reply(await notificationError('Cette commande s’utilise dans un salon vocal.'));
        }

        const sessions = this.client.callSessions.cache;
        const membersToAdd = channel.members.filter(({ id }) => !sessions.get(id));

        if (membersToAdd.size <= 0) {
            return message.reply(await notificationError('Aucun membre à synchroniser dans ce salon.'));
        }

        for (const [memberId, { voice }] of membersToAdd) {
            this.client.callSessions.start(memberId, voice);
        }

        return await message.reply({
            embeds: [
                EmbedUI.create({
                    color: 'green',
                    title: '🔍 Debug - Sessions Vocales',
                    description: `Les **${membersToAdd.size}** membres pas synchro sont maintenant en cache ;)`
                })
            ]
        });
    }
});
