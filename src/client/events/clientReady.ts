import { Event } from '@/structures'
import { logger } from '@/utils'

export default new Event({
    once: true,
    name: 'clientReady',
    async run() {
        const sessions = this.client.callSessions.cache;
        let synced = 0;

        for (const guild of this.client.guilds.cache.values()) {
            for (const channel of guild.channels.cache.values()) {
                if (!channel.isVoiceBased()) continue;

                for (const [memberId, member] of channel.members) {
                    if (sessions.has(memberId)) continue;

                    this.client.callSessions.start(memberId, member.voice);
                    synced++;
                }
            }
        }

        logger.info(`[CallSessions] ${synced} voice session sync`);
    }
});