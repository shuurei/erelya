import { Guild, GuildMember } from 'discord.js'
import { GuildLevelRewardService } from '@/database/services/guild-level-reward.service'

export async function handleMemberRoleRewardSync({
    guild,
    member,
    activityLevel,
}: {
    guild: Guild;
    member: GuildMember;
    activityLevel: number;
}) {
    const rewards = await GuildLevelRewardService.all(guild.id);
    if (!rewards.length) return { totalGuildPoints: 0, roleIds: [] };

    const eligibleRewards = rewards
        .filter(({ atLevel, roleId }) => atLevel <= activityLevel && roleId)
        .sort((a, b) => b.atLevel - a.atLevel);

    if (!eligibleRewards.length) return { totalGuildPoints: 0, roleIds: [] };

    const highestReward = eligibleRewards[0];
    const memberRoles = member.roles.cache;

    const rolesToAdd = eligibleRewards
        .filter(({ isStackable, roleId }) => roleId && (isStackable || roleId === highestReward.roleId))
        .filter(({ roleId }) => roleId && !memberRoles.has(roleId) && guild.roles.cache.has(roleId));

    const rolesToRemove = eligibleRewards
        .filter(({ isStackable, roleId }) => roleId && !isStackable && roleId !== highestReward.roleId)
        .filter(({ roleId }) => roleId && memberRoles.has(roleId) && guild.roles.cache.has(roleId));

    if (rolesToRemove.length) {
        await member.roles.remove(rolesToRemove.map(({ roleId }) => roleId!));
    }

    if (rolesToAdd.length) {
        await member.roles.add(rolesToAdd.map(({ roleId }) => roleId!));
    }

    const totalGuildPoints = rolesToAdd.reduce((sum, { coinsReward }) => sum + (coinsReward ?? 0), 0);
    const addedRoleIds = rolesToAdd.map(r => r.roleId!);

    return {
        totalGuildPoints,
        roleIds: addedRoleIds,
    };
}
