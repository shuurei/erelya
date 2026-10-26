import { Channel, GuildMember } from 'discord.js'

import { handleMemberRoleRewardSync } from './member-role-reward-sync'
import { getDominantColor, levelToXp, xpToLevel } from '@/utils'
import { levelUpCard } from '@/ui/assets/cards/levelUpCard'
import { guildMemberHelperSync } from '@/helpers'
import { GuildMemberService } from '@/database/services/guild-member.service'
import { GuildModuleService } from '@/database/services/guild-module.service'

const isAtMaxLevel = (maxLevel?: number, level?: number) => {
    return typeof maxLevel === 'number' && typeof level === 'number'
        ? level >= maxLevel
        : false
}

export async function handleMemberCheckLevelUp({ member, channel, xpGain }: {
    member: GuildMember | undefined;
    channel?: Channel | null;
    xpGain: number;
}) {
    if (!member || xpGain <= 0) return

    const guildId = member.guild.id;
    const userId = member.user.id;

    const [
        memberDatabase,
        guildLevelModule,
        guildEcoModule
    ] = await Promise.all([
        GuildMemberService.findById({ guildId, userId }),
        GuildModuleService.findByName(guildId, 'level'),
        GuildModuleService.findByName(guildId, 'economy')
    ]);

    if (!guildLevelModule?.isEnabled) return

    const maxLevel = guildLevelModule.maxLevel;
    const isPrestigeEnabled = guildLevelModule.isPrestigeEnabled;

    const currentXp = memberDatabase?.xp ?? 0;
    const currentLevel = memberDatabase?.totalLevel ?? xpToLevel(currentXp);

    if (!isPrestigeEnabled && isAtMaxLevel(maxLevel, currentLevel)) return

    const nextXp = currentXp + xpGain;
    const calculatedLevel = xpToLevel(nextXp);

    const newLevel = isPrestigeEnabled
        ? calculatedLevel
        : Math.min(calculatedLevel, maxLevel);

    const reachMaxLevel = !isPrestigeEnabled && isAtMaxLevel(maxLevel, newLevel);

    if (reachMaxLevel) {
        await GuildMemberService.setXp({ userId, guildId }, levelToXp(maxLevel));
    } else {
        await GuildMemberService.addXp({ userId, guildId }, xpGain);
    }

    if (newLevel <= currentLevel) return

    const getProgression = (totalLevel: number) => {
        if (!isPrestigeEnabled) {
            return {
                prestige: 0,
                level: totalLevel
            }
        }

        return {
            prestige: Math.max(0, Math.floor((totalLevel - 1) / maxLevel)),
            level: ((totalLevel - 1) % maxLevel) + 1
        }
    }

    const previousProgression = getProgression(currentLevel);
    const newProgression = getProgression(newLevel);

    const prestigeChanged = isPrestigeEnabled && newProgression.prestige > previousProgression.prestige

    const rewards = await handleMemberRoleRewardSync({
        guild: member.guild,
        member,
        activityLevel: isPrestigeEnabled ? newProgression.level : newLevel
    });

    if (!channel?.isSendable()) return

    const memberHelper = guildMemberHelperSync(member);

    const displayLevel = reachMaxLevel ? 'MAX' : newLevel.toLocaleString('fr-FR');

    const messageLines: string[] = []

    if (prestigeChanged) {
        messageLines.push(
            `Prestige **${previousProgression.prestige}** ➔ **${newProgression.prestige}** !`,
            `Nv. **${previousProgression.level}** ➔ Nv. **${newProgression.level}** 🎉`
        );
    } else if (isPrestigeEnabled && newProgression.prestige > 0) {
        messageLines.push(`Prestige **${newProgression.prestige}** · Nv. **${previousProgression.level}** ➔ **${newProgression.level}** 🎉`);
    } else {
        messageLines.push(`Nv. **${currentLevel}** ➔ Nv. **${displayLevel}** 🎉`);
    }

    if (rewards.roleIds.length) {
        messageLines.push(`> 🏅 ${rewards.roleIds.length === 1 ? 'Nouveau rôle débloqué' : 'Nouveaux rôles débloqués'} :`);

        rewards.roleIds.forEach((roleId) => {
            messageLines.push(`> - <@&${roleId}>`)
        });
    }

    if (guildEcoModule?.isEnabled && rewards.totalGuildPoints > 0) {
        await GuildMemberService.addCoins({ guildId, userId }, rewards.totalGuildPoints);

        messageLines.push(`> 💰 Gain de pièces : **${rewards.totalGuildPoints.toLocaleString('fr-FR')}**`);
    }

    return await channel.send({
        content: messageLines.join('\n'),
        allowedMentions: {
            roles: [],
            users: [member.id],
            repliedUser: true
        },
        files: [
            {
                attachment: await levelUpCard({
                    username: memberHelper.getName({ safe: true }),
                    avatarURL: memberHelper.getAvatarURL(),
                    accentColor: member.roles.color?.hexColor ?? await getDominantColor(memberHelper.getAvatarURL(), { returnRGB: false }),
                    newLevel: displayLevel
                }),
                name: 'levelUpCard.png'
            }
        ]
    })
}