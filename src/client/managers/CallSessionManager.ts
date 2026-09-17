import { Locale, VoiceState } from 'discord.js'
import { CustomClient } from '@/structures'
import { GuildMemberService } from '@/database/services/guild-member.service';

interface CallSessionFlags {
    isPrivate: boolean;
    isMuted: boolean;
    isDeaf: boolean;
    isStreaming: boolean;
    hasCamera: boolean;
}

type CallSessionData = {
    guildId: string;
    guildLocale: Locale;
    channelId: string;
    timestamp: number;
    flags: CallSessionFlags;
}

export class CallSessionManager {
    cache = new Map<string, CallSessionData>();

    constructor(public client: CustomClient) { }

    getFlags(state: VoiceState) {
        const isDeaf = (state.selfDeaf || state.serverDeaf) ?? false;
        const isMuted = (state.selfMute || state.serverMute) ?? false;

        const everyonePerm = state.channel?.permissionsFor(state.guild.roles.everyone);
        const isPrivate = everyonePerm
            ? !(everyonePerm.has('Connect') && everyonePerm.has('ViewChannel'))
            : false;

        return {
            isPrivate,
            isDeaf,
            isMuted,
            isStreaming: state.streaming ?? false,
            hasCamera: state.selfVideo ?? false,
        }
    }

    get(userId: string) {
        return this.cache.get(userId);
    }

    start(userId: string, state: VoiceState) {
        if (state.channelId) {
            return this.cache.set(userId, {
                guildId: state.guild.id,
                guildLocale: state.guild.preferredLocale,
                channelId: state.channelId,
                timestamp: Date.now(),
                flags: this.getFlags(state),
            });
        }
    }

    stop(userId: string) {
        const session = this.cache.get(userId);

        if (session) {
            this.cache.delete(userId);
        }

        return session
    }

    async update(userId: string, state: VoiceState) {
        let session = this.cache.get(userId);
        if (!session) return null

        const nextFlags = this.getFlags(state);
        const changed = (
            session.channelId !== state.channelId ||
            session.flags.isDeaf !== nextFlags.isDeaf ||
            session.flags.isMuted !== nextFlags.isMuted ||
            session.flags.isStreaming !== nextFlags.isStreaming ||
            session.flags.hasCamera !== nextFlags.hasCamera ||
            session.flags.isPrivate !== nextFlags.isPrivate
        );

        if (changed && state.guild) {
            await this.flush(userId, state.guild.id);

            session = {
                guildId: state.guild.id,
                guildLocale: state.guild.preferredLocale,
                channelId: state.channelId!,
                timestamp: Date.now(),
                flags: nextFlags
            };

            this.cache.set(userId, session);
        }

        return session;
    }

    async flush(userId: string, guildId: string) {
        const session = this.cache.get(userId);
        if (!session) return;

        const now = Date.now();
        const minutesElapsed = Math.floor((now - session.timestamp) / 60000);
        if (minutesElapsed <= 0) return;

        const { flags } = session;
        if (flags.isDeaf) {
            await GuildMemberService.incrementCallDeafTime({ userId, guildId }, minutesElapsed);
        } else if (flags.isMuted) {
            await GuildMemberService.incrementCallMutedTime({ userId, guildId }, minutesElapsed);
        } else {
            await GuildMemberService.incrementCallActiveTime({ userId, guildId }, minutesElapsed);
        }

        if (session.flags.isPrivate) {
            await GuildMemberService.incrementCallPrivateTime({ userId, guildId }, minutesElapsed);
        } else {
            await GuildMemberService.incrementCallPublicTime({ userId, guildId }, minutesElapsed);
        }

        if (session.flags.isStreaming) {
            await GuildMemberService.incrementCallStreamingTime({ userId, guildId }, minutesElapsed);
        }

        if (session.flags.hasCamera) {
            await GuildMemberService.incrementCallCameraTime({ userId, guildId }, minutesElapsed);
        }

        session.timestamp = now;

        this.cache.set(userId, session);

        return session;
    }
}