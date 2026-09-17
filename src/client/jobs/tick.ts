import { Cron } from 'croner'
import { jobsLogger } from './index'

import client from '../instance'

import { randomNumber, timeElapsedFactor } from '@/utils'
import { handleMemberCheckLevelUp } from '../handlers/member-check-level-up'
import { handleMemberDailyQuestSync } from '../handlers/member-daily-quest-sync'
import { handleMemberDailyQuestNotify } from '../handlers/member-daily-quest-notify'
import { UserService } from '@/database/services/user.service'
import { GuildModuleService } from '@/database/services/guild-module.service'
import { ChannelBlacklistService } from '@/database/services/channel-blacklist.service'
import { GuildMemberService } from '@/database/services/guild-member.service'
import { GuildMemberDailyQuestType } from '@/database/entities/guild-member/daily-quest.entity'
import { GuildMemberDailyQuestService } from '@/database/services/guild-member-daily-quest.service'

jobsLogger.info(({ yellowBright }) => `${yellowBright('Tick Job')} started`, { arrowColor: 'greenBright' });

const factor = (condition: any, value = 0) => condition ? value : 0;

new Cron('* * * * *', async () => {
    try {
        for (const [userId, session] of client.callSessions.cache) {
            const guild = client.guilds.cache.find((guild) => guild.id === session.guildId);
            if (!guild) continue;

            const now = Date.now();
            const elapsed = now - session.timestamp;
            const minutesElapsed = Math.floor(elapsed / (60 * 1000));

            if (minutesElapsed <= 0) continue;

            const guildId = guild.id;

            const [
                userDatabase,
                guildEcoModule,
                guildLevelModule,
                guildQuestModule,
                channelScopeBlacklist
            ] = await Promise.all([
                UserService.findById(userId),
                GuildModuleService.findByName(guildId, 'economy'),
                GuildModuleService.findByName(guildId, 'level'),
                GuildModuleService.findByName(guildId, 'quest'),
                ChannelBlacklistService.findMany({ guildId, channelId: session.channelId })
            ]);

            const member = guild.members.cache.get(userId);

            const guildBoostElapsedProgress = timeElapsedFactor(member?.premiumSince, 7);
            const tagBoostElapsedProgress = timeElapsedFactor(userDatabase?.tagAssignedAt, 14);

            if (guildEcoModule?.isEnabled && !channelScopeBlacklist.ECONOMY && guildEcoModule.isGuildCoinsFromCallEnabled) {
                if ((minutesElapsed % guildEcoModule.callGainIntervalMinutes) === 0) {
                    const maxGain = guildEcoModule.callMaxGain;
                    const minGain = guildEcoModule.callMinGain;

                    // Penalty
                    const callPrivateFactor = factor(session.flags.isPrivate, guildEcoModule.callPrivatePenalty);
                    const muteFactor = factor(session.flags.isMuted, guildEcoModule.callMutedPenalty);
                    const deafFactor = factor(session.flags.isDeaf, guildEcoModule.callDeafPenalty);

                    const penaltyFactor = deafFactor + muteFactor + callPrivateFactor;

                    // Bonus
                    const guildBoostFactor = factor(guildEcoModule.guildBoosterFactor, guildBoostElapsedProgress * guildEcoModule.guildBoosterFactor);
                    const tagBoostFactor = factor(guildEcoModule.tagSupporterFactor, tagBoostElapsedProgress * guildEcoModule.tagSupporterFactor);
                    const cameraBoostFactor = factor(session.flags.hasCamera, guildEcoModule.callCameraBonus);
                    const streamBoostFactor = factor(session.flags.isStreaming, guildEcoModule.callStreamBonus);

                    const bonusFactor = tagBoostFactor + guildBoostFactor + cameraBoostFactor + streamBoostFactor;

                    const randomCoins = Math.floor(randomNumber(minGain, maxGain) * (1 + (bonusFactor)) * (1 - (penaltyFactor)));

                    if (randomCoins > 0) {
                        await GuildMemberService.addCoins({ userId, guildId, }, randomCoins);
                    }
                }
            }

            if (guildLevelModule?.isEnabled && !channelScopeBlacklist.LEVEL && guildLevelModule?.isXpFromMessageEnabled) {
                if ((minutesElapsed % guildLevelModule.callGainIntervalMinutes) === 0) {
                    const maxGain = 250;
                    const minGain = 150;

                    // Penalty
                    const callPrivateFactor = factor(session.flags.isPrivate, guildLevelModule.callPrivatePenalty);
                    const muteFactor = factor(session.flags.isMuted, guildLevelModule.callMutedPenalty);
                    const deafFactor = factor(session.flags.isDeaf, guildLevelModule.callDeafPenalty);

                    const penaltyFactor = deafFactor + muteFactor + callPrivateFactor;

                    // Bonus
                    const guildBoostFactor = factor(guildLevelModule.guildBoosterFactor, guildBoostElapsedProgress * guildLevelModule.guildBoosterFactor);
                    const tagBoostFactor = factor(guildLevelModule.tagSupporterFactor, tagBoostElapsedProgress * guildLevelModule.tagSupporterFactor);
                    const cameraBoostFactor = factor(session.flags.hasCamera, guildLevelModule.callCameraBonus);
                    const streamBoostFactor = factor(session.flags.isStreaming, guildLevelModule.callStreamBonus);

                    const bonusFactor =
                        tagBoostFactor +
                        guildBoostFactor +
                        cameraBoostFactor +
                        streamBoostFactor;

                    const randomXP = Math.floor(
                        randomNumber(minGain, maxGain) * (1 + bonusFactor) * (1 - penaltyFactor)
                    );

                    if (randomXP > 0) {
                        await handleMemberCheckLevelUp({
                            member,
                            channel: guild.channels.cache.get(session.channelId),
                            xpGain: randomXP
                        });
                    }
                }
            }

            if (guildQuestModule?.isEnabled && !channelScopeBlacklist.QUEST && !(session.flags.isDeaf || session.flags.isMuted)) {
                const quest = await handleMemberDailyQuestSync({ userId, guildId }, session.guildLocale);

                if (!quest.isClaimed && (quest.type === GuildMemberDailyQuestType.CALL || session.flags.isStreaming)) {
                    if (quest.progress < quest.target) {
                        const newQuest = await GuildMemberDailyQuestService.updateOrCreate({ userId, guildId }, {
                            progress: quest.progress + 1
                        });

                        await handleMemberDailyQuestNotify({
                            member: guild.members.cache.get(userId),
                            channel: guild.channels.cache.get(session.channelId),
                            oldQuest: quest,
                            newQuest
                        });
                    }
                }
            }
        }

        // Clear Spam Cache
        if (client.spamBuffer.size > 0) {
            client.spamBuffer.clear();
        }
    } catch (ex: any) {
        return jobsLogger.error(ex);
    }
}, { name: 'tick-jobs', timezone: 'UTC' });
