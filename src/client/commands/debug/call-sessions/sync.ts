import { Command } from '@/structures/Command'
import { EmbedUI } from '@/ui/EmbedUI'

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
            return await message.reply({
                embeds: [
                    EmbedUI.createErrorMessage({
                        title: '🔍 Debug - Sessions Vocales',
                        description: `Oups.. Cette commande s'utilise sur des salons vocaux`
                    })
                ]
            });
        }

        const sessions = this.client.callSessions.cache;
        const membersToAdd = channel.members.filter(({ id }) => !sessions.get(id));

        if (membersToAdd.size <= 0) {
            return await message.reply({
                embeds: [
                    EmbedUI.create({
                        color: 'red',
                        title: '🔍 Debug - Sessions Vocales',
                        description: `Les **${membersToAdd.size}** membres sont déjà synchro en cache :)`
                    })
                ]
            });
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
