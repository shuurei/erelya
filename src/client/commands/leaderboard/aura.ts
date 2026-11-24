import { Command } from '@/structures/Command'
import { GuildMember } from 'discord.js'
import { EmbedUI } from '@/ui/EmbedUI'
import { db } from '@/database/db'
import { MemberAura } from '@/database/entities/member-aura.entity'
import { AuraPlayer } from '@/database/entities/aura-player.entity'
import { Aura } from '@/database/entities/aura.entity'
import { guildMemberHelperSync } from '@/helpers'
import { formatAuraChance } from '@/utils/aura'
import { getDominantColor } from '@/utils'

const buildEmbed = async (member: GuildMember) => {
    const guild = member.guild;
    const rows = await db.getRepository(MemberAura)
        .createQueryBuilder('owned')
        .innerJoin(Aura, 'aura', 'aura.id = owned."auraId"')
        .leftJoin(AuraPlayer, 'player', 'player."guildId" = owned."guildId" AND player."userId" = owned."userId"')
        .where('owned."guildId" = :guildId', { guildId: guild.id })
        .andWhere('owned.count > 0')
        .andWhere('(player."equippedAuraId" IS NULL OR player."equippedAuraId" != owned."auraId")')
        .select(['owned."userId" AS "userId"', 'aura.name AS "name"', 'aura.chance AS "chance"'])
        .orderBy('aura.chance', 'DESC')
        .getRawMany<{ userId: string; name: string; chance: string }>();

    const best = new Map<string, typeof rows[number]>();
    for (const row of rows) {
        if (!best.has(row.userId)) {
            best.set(row.userId, row);
        }
    }

    const ranked = [...best.entries()].sort((a, b) => BigInt(a[1].chance) > BigInt(b[1].chance) ? -1 : BigInt(a[1].chance) < BigInt(b[1].chance) ? 1 : 0);
    const ids = ranked.slice(0, 10).map(([id]) => id);
    const members = await guild.members.fetch({ user: ids });
    const medals = ['🥇', '🥈', '🥉'];

    const lines = ranked.slice(0, 10).flatMap(([id, aura], i) => {
        const target = members.get(id);
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
