import { Command } from '@/structures/Command'
import { GuildMember } from 'discord.js'
import { EmbedUI } from '@/ui/EmbedUI'
import { db } from '@/database/db'
import { MemberAura } from '@/database/entities/member-aura.entity'
import { AuraPlayer } from '@/database/entities/aura-player.entity'
import { AURAS_BY_KEY, type RollableAura } from '@/data/auras'
import { guildMemberHelperSync } from '@/helpers'
import { formatAuraChance } from '@/utils/aura'
import { getDominantColor } from '@/utils'

const buildEmbed = async (member: GuildMember) => {
    const guild = member.guild;
    const rows = await db.getRepository(MemberAura)
        .createQueryBuilder('owned')
        .leftJoin(AuraPlayer, 'player', 'player."guildId" = owned."guildId" AND player."userId" = owned."userId"')
        .where('owned."guildId" = :guildId', { guildId: guild.id })
        .andWhere('owned.count > 0')
        .andWhere('(player."equippedAuraKey" IS NULL OR player."equippedAuraKey" != owned."auraKey")')
        .select(['owned."userId" AS "userId"', 'owned."auraKey" AS "auraKey"'])
        .getRawMany<{ userId: string; auraKey: string }>();

    const best = new Map<string, RollableAura>();
    for (const { userId, auraKey } of rows) {
        const aura = AURAS_BY_KEY.get(auraKey);
        const previous = best.get(userId);
        if (aura && aura.chance !== null && (!previous || aura.chance > previous.chance)) {
            best.set(userId, aura);
        }
    }

    const ranked = [...best.entries()].sort((a, b) => a[1].chance > b[1].chance ? -1 : a[1].chance < b[1].chance ? 1 : 0);
    const ids = ranked.slice(0, 10).map(([id]) => id);
    const members = ids.length ? await guild.members.fetch({ user: ids }) : null;
    const medals = ['🥇', '🥈', '🥉'];

    const lines = ranked.slice(0, 10).flatMap(([id, aura], i) => {
        const target = members?.get(id);
        if (!target || target.user.bot) return [];

        return [`${medals[i] ?? `**${i + 1}.**`} **${guildMemberHelperSync(target).getName()}** - ✨ \`${aura.name}\` (${formatAuraChance(aura.chance)})`];
    });

    const guildIcon = guild.iconURL();
    const guildIconDominantColor = guildIcon ? await getDominantColor(guildIcon) : undefined;


    return EmbedUI.createMessage({
        color: guildIconDominantColor,
        title: `Classement des auras rares de ${guild.name}`,
        description: lines.join('\n') || 'Aucune aura en collection pour le moment..'
    });
};

export default new Command({
    description: 'Classement des membres possédant les auras les plus rares',
    access: { guild: { modules: { economy: { isEnabled: true } } } },
    async onInteraction(interaction) {
        await interaction.deferReply();
        return interaction.editReply({ embeds: [await buildEmbed(interaction.member)] });
    },
    async onMessage(message) {
        return message.reply({ embeds: [await buildEmbed(message.member as GuildMember)] });
    }
});
