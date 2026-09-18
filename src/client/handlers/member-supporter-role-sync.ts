import { GuildMember } from 'discord.js'
import { GuildService } from '@/database/services/guild.service'
import { UserService } from '@/database/services/user.service'

export async function handleMemberSupporterRoleSync(member: GuildMember) {
    const userId = member.id;
    const guild = member.guild;
    const guildId = guild.id;

    const { supportRoleId } = await GuildService.findById(guildId) ?? {};
    if (!supportRoleId) return;

    const hasTag = member.user.primaryGuild?.identityGuildId === guildId;
    const hasRole = member.roles.cache.has(supportRoleId);

    if (hasTag && hasRole) return;

    if (!hasTag && hasRole) {
        await UserService.resetTagAssignedAt(userId);
        await member.roles.remove(supportRoleId);
    } else if (hasTag && !hasRole) {
        await UserService.setTagAssignedAt(userId);
        await member.roles.add(supportRoleId);
    }
}
