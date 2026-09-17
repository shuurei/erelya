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

export async function handleMemberCheckLevelUp({
    member,
    channel,
    xpGain,
}: {
    member: GuildMember | undefined;
    channel?: Channel | null;
    xpGain: number
}) {
    if (!member) return;

    const guildId = member.guild.id
    const userId = member.user.id

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

    const currentLevel = memberDatabase?.level ?? 1;
    const currentXp = memberDatabase?.xp ?? 0;

    if (isAtMaxLevel(guildLevelModule.maxLevel, currentLevel)) return

    const nextXp = currentXp + xpGain;
    const newLevel = xpToLevel(nextXp);

    const reachMaxLevel = isAtMaxLevel(guildLevelModule.maxLevel, newLevel);

    if (reachMaxLevel) {
        const xpMaxLevel = levelToXp(guildLevelModule.maxLevel);
        await GuildMemberService.setXp({ userId, guildId }, xpMaxLevel);
    } else {
        await GuildMemberService.addXp({ userId, guildId }, xpGain);
    }

    if (newLevel <= currentLevel) return

    const rewards = await handleMemberRoleRewardSync({
        guild: member.guild,
        member,
        activityLevel: newLevel
    });

    if (!(channel && channel.isSendable())) return;

    const memberHelper = guildMemberHelperSync(member);
    const displayLevel = reachMaxLevel ? 'MAX' : newLevel;

    const messageLines: string[] = [
        `Nv. **${currentLevel}** ➔ Nv. **${displayLevel}** 🎉`
    ];

    if (rewards.roleIds.length) {
        messageLines.push(
            `> 🏅 ${rewards.roleIds.length === 1 ? 'Nouveau rôle débloqué' : 'Nouveaux rôles débloqués'} :`
        );

        rewards.roleIds.forEach(roleId =>
            messageLines.push(`> - <@&${roleId}>`)
        );
    }

    if (guildEcoModule?.isEnabled && rewards?.totalGuildPoints > 0) {
        await GuildMemberService.addCoins({ guildId, userId }, rewards.totalGuildPoints);

        messageLines.push(
            `> 💰 Gain de pièces : **${rewards.totalGuildPoints.toLocaleString('en')}**`
        );
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
                    accentColor:
                        member.roles.color?.hexColor ??
                        await getDominantColor(memberHelper.getAvatarURL(), { returnRGB: false }),
                    newLevel: displayLevel
                }),
                name: 'levelUpCard.png'
            }
        ]
    });
}
