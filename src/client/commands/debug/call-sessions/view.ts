import { Command } from '@/structures/Command'
import { applicationEmojiHelper } from '@/helpers'
import { EmbedUI } from '@/ui/EmbedUI'

export default new Command({
    access: {
        user: { isDeveloper: true }
    },
    messageCommand: {
        style: 'slashCommand'
    },
    async onMessage(message, { args: [channelId] }) {
        const sessions = this.client.callSessions.cache;

        const guild = message.guild;
        if (!guild) return;

        const { whiteArrowEmoji } = applicationEmojiHelper();

        let targetChannelId: string | null = null;
        let targetLabel = 'Guilde entière';

        if (channelId) {
            targetChannelId = channelId;
            const channel = guild.channels.cache.get(channelId);
            if (channel) {
                targetLabel = `Salon ${whiteArrowEmoji} **\`${channel.name}\`**`;
            }
        } else if (message.member?.voice?.channelId) {
            targetChannelId = message.member.voice.channelId;
            const channel = guild.channels.cache.get(targetChannelId);
            if (channel) {
                targetLabel = `Salon ${whiteArrowEmoji} **\`${channel.name}\`**`;
            }
        }

        const filteredSessions = [...sessions.entries()].filter(([_, session]) => {
            if (targetChannelId) {
                return session.channelId === targetChannelId;
            }
            
            return session.guildId === guild.id;
        });

        const totalSessions = filteredSessions.length;
        const inSession = sessions.has(message.author.id);
        const sampleSessions = filteredSessions.slice(0, 10);

        return await message.reply({
            embeds: [
                EmbedUI.create({
                    color: 'indigo',
                    title: '🔍 Debug - Sessions Vocales',
                    fields: [
                        {
                            name: '📊 Nombre total de sessions',
                            value: `\`${totalSessions}\``,
                            inline: true
                        },
                        {
                            name: '🙋‍♂️ Présent en session ?',
                            value: inSession ? '✅ Oui' : '❌ Non',
                            inline: true
                        },
                        {
                            name: '📍 Filtre actif',
                            value: targetLabel
                        },
                        {
                            name: '🆔 Aperçu des sessions',
                            value: sampleSessions.length > 0
                                ? sampleSessions
                                    .map(([id, session]) => {
                                        const member = this.client.users.cache.get(id);
                                        const flags = session.flags;

                                        const statusEmojis = [
                                            flags.isDeaf ? '🙉' : flags.isMuted ? '🙊' : '🔊',
                                            flags.isPrivate ? '🔒' : '🌐',
                                            flags.isStreaming ? '🎥' : '',
                                            flags.hasCamera ? '📹' : '',
                                        ].filter(Boolean).join(' ');

                                        const timeAgo = `<t:${Math.floor(session.timestamp / 1000)}:R>`;

                                        return `\`${member?.username ?? 'Unknown'}\` (${id}) • ${statusEmojis} • ⏱️ ${timeAgo}`;
                                    })
                                    .join('\n')
                                : 'Aucune session active'
                        }
                    ],
                    footer: {
                        text: sampleSessions.length < totalSessions
                            ? `Seulement ${sampleSessions.length} / ${totalSessions} affichées`
                            : 'Toutes les sessions sont affichées'
                    }
                })
            ]
        });
    }
});
