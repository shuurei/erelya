import { GuildMemberDailyQuest, GuildMemberDailyQuestType } from '@/database/entities/guild-member/daily-quest.entity';
import { Channel, GuildMember } from 'discord.js'

export async function handleMemberDailyQuestNotify({
    member,
    channel,
    oldQuest,
    newQuest
}: {
    member?: GuildMember;
    channel?: Channel | null;
    oldQuest: GuildMemberDailyQuest;
    newQuest: GuildMemberDailyQuest;
}) {
    if (oldQuest.isClaimed || !channel?.isSendable() || !member) return;

    if (newQuest.progress >= newQuest.target) {
        await channel.send(`🎁 \`${member.user.username}\` **Quête ${newQuest.type === GuildMemberDailyQuestType.CALL ? 'vocal' : 'streamin'} quotidienne complétée !** La récompense est disponible :)`);
    }
}