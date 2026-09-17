import type { Locale } from 'discord.js'
import { DateTime } from 'luxon'

import { tzMap } from '@/utils'

import { generateDailyQuest } from '@/utils/daily-quest'
import { GuildMemberDailyQuestService } from '@/database/services/guild-member-daily-quest.service';

export async function handleMemberDailyQuestSync(memberKey: { userId: string; guildId: string }, guildLocale: Locale) {
    const guildTZ = tzMap[guildLocale] || 'UTC';

    let quest = await GuildMemberDailyQuestService.findById(memberKey);

    const now = DateTime.now().setZone(guildTZ);
    const last = quest?.startAt
        ? DateTime.fromJSDate(quest.startAt, { zone: guildTZ })
        : null;

    const isSameDay = last ? last.hasSame(now, 'day') : false;
    if (quest && isSameDay) {
        return quest;
    }

    if (!quest || !isSameDay) {
        const { type, value } = generateDailyQuest();

        quest = await GuildMemberDailyQuestService.updateOrCreate(memberKey, {
            type,
            target: value,
            startAt: new Date(),
            isClaimed: false
        });
    }

    return quest;
}
