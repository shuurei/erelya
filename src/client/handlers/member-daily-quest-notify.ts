import { Channel, GuildMember } from 'discord.js'
import { MemberDailyQuestModel } from '@/database/core/models'

export async function handleMemberDailyQuestNotify({
    member,
    channel,
    oldQuest,
    newQuest
}: {
    member?: GuildMember;
    channel?: Channel | null;
    oldQuest: MemberDailyQuestModel,
    newQuest: MemberDailyQuestModel
}) {
    if (oldQuest.isClaimed || !channel?.isSendable() || !member) return;

    const streamingJustCompleted = oldQuest.streamingMinutesTarget
        ? oldQuest.streamingMinutesProgress < oldQuest.streamingMinutesTarget &&
        newQuest.streamingMinutesProgress >= newQuest.streamingMinutesTarget!
        : false;

    const voiceJustCompleted = oldQuest.voiceMinutesTarget
        ? oldQuest.voiceMinutesProgress < oldQuest.voiceMinutesTarget &&
        newQuest.voiceMinutesProgress >= newQuest.voiceMinutesTarget!
        : false;

    const isStreamingCompleted = newQuest.streamingMinutesTarget
        ? newQuest.streamingMinutesProgress >= newQuest.streamingMinutesProgress!
        : true;

    const isVoiceCompleted = newQuest.voiceMinutesTarget
        ? newQuest.voiceMinutesProgress >= newQuest.voiceMinutesTarget!
        : true;

    if (isStreamingCompleted && isVoiceCompleted) {
        await channel.send(`\`${member.user.username}\` **Quête quotidienne complétée !** Récompense disponible 🎁`);
    } else if (voiceJustCompleted) {
        await channel.send(`\`${member.user.username}\` **Quête quotidienne** 🎯 — Objectif vocal complété (**1 / 2**)`);
    } else if (streamingJustCompleted) {
        await channel.send(`\`${member.user.username}\` **Quête quotidienne** 🎯 — Objectif message complété (**1 / 2**)`);
    }
}