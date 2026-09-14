import type { Locale } from 'discord.js'
import { DateTime } from 'luxon'

import { memberDailyQuestService } from '@/database/services/member-daily-quest'
import { tzMap } from '@/utils'

import { generateDailyQuest } from '@/utils/daily-quest'

export async function handleMemberDailyQuestSync(
    memberKey: { userId: string; guildId: string },
    guildLocale: Locale
) {
    const guildTZ = tzMap[guildLocale] || 'UTC';

    let quest = await memberDailyQuestService.findById(memberKey);

    const now = DateTime.now().setZone(guildTZ);
    const last = quest?.startAt
        ? DateTime.fromJSDate(quest.startAt, { zone: guildTZ })
        : null;

    const isSameDay = last ? last.hasSame(now, 'day') : false;

    if (quest && isSameDay) {
        return quest;
    }

    if (!quest || !isSameDay) {
        const { voice, streaming } = generateDailyQuest();

        quest = await memberDailyQuestService.updateOrCreate(memberKey, {
            voiceMinutesTarget: voice?.value ?? null,
            voiceMinutesProgress: 0,
            streamingMinutesTarget: streaming?.value ?? null,
            streamingMinutesProgress: 0,
            startAt: new Date(),
            isClaimed: false
        });
    }

    return quest;
}
