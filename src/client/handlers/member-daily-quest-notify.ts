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

    const questType = newQuest.voiceMinutesTarget ? 'voice' : 'streaming';
    const questMinutesTarget = [`${questType}MinutesTarget`];
    const questMinutesProgress = [`${questType}MinutesProgress`];

    if (questMinutesProgress >= questMinutesTarget) {
        await channel.send(`🎁 \`${member.user.username}\` **Quête ${questType ? 'vocal' : 'streamin'} quotidienne complétée !** La récompense est disponible :)`);
    }
}