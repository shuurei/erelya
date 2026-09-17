import { Event } from '@/structures'
import { GuildService } from '@/database/services/guild.service'

import { EmbedUI } from '@/ui/EmbedUI'

export default new Event({
    name: 'messageUpdate',
    async run({ events: [oldMessage, newMessage] }) {
        if (!oldMessage.guild
            || newMessage.author?.bot
            || oldMessage.content === newMessage.content
            || !oldMessage.content
            || !newMessage.content
            || oldMessage.channel.isDMBased()
            || newMessage.channel.isDMBased()
            || !newMessage.guild
        ) return;

        const { messageEditedAuditChannelId } = await GuildService.findById(newMessage.guild.id) ?? {};
        if (!messageEditedAuditChannelId) return;

        const channel = newMessage.guild.channels.cache.get(messageEditedAuditChannelId);
        if (!channel?.isTextBased()) return;

        return await channel.send({
            embeds: [
                EmbedUI.createMessage({
                    color: 'orange',
                    author: {
                        name: newMessage.author!.username,
                        iconURL: newMessage.author?.displayAvatarURL()
                    },
                    description: `✏️ **Message modifié**`,
                    fields: [
                        {
                            name: 'Salon',
                            value: `<#${newMessage.channel.id}> (\`${newMessage.channel.name}\`)`,
                        },
                        {
                            name: 'Avant',
                            value: oldMessage.content.slice(0, 1024)
                        },
                        {
                            name: 'Après',
                            value: newMessage.content.slice(0, 1024)
                        }
                    ],
                    footer: {
                        text: `UID: ${newMessage.author.id}`
                    },
                    timestamp: Date.now()
                })
            ]
        });
    }
})