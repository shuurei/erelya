import { Command } from '@/structures'
import { ApplicationCommandOptionType, GuildFeature, GuildMember } from 'discord.js'

import { createProgressBar } from '@/ui/components'
import { EmbedUI } from '@/ui'

import { guildMemberHelper } from '@/helpers'
import { getDominantColor, parseUserMention, timeElapsedFactor, xpToNextLevel } from '@/utils'
import { createBoostLine } from '@/ui/components/createBoostLine'
import { GuildMemberService } from '@/database/services/guild-member.service'
import { UserService } from '@/database/services/user.service'
import { GuildModuleService } from '@/database/services/guild-module.service'

const buildEmbed = async (member: GuildMember) => {
    const memberHelper = await guildMemberHelper(member);

    if (member.user.bot) {
        return EmbedUI.createErrorMessage({
            title: `${memberHelper.getName({ safe: true })} — Expérience`,
            description: `Les bots ne possèdent pas de progression d'XP ni de rang dans le classement`
        });
    }

    const userId = member.id;
    const guild = member.guild;
    const guildId = guild.id;

    const memberAvatar = memberHelper.getAvatarURL();

    const [
        memberAvatarDominantColor,
        memberData,
        leaderboard,
        user,
        guildLevelModule
    ] = await Promise.all([
        getDominantColor(memberAvatar),
        GuildMemberService.findById({ userId, guildId }),
        GuildMemberService.getActivityXpRank({ userId, guildId }),
        UserService.findById(userId),
        GuildModuleService.findOrCreate(guildId, 'level')
    ]);

    const xp = memberData?.xp ?? 0;

    const tagSupporterFactor = guildLevelModule.tagSupporterFactor;
    const boosterFactor = guildLevelModule.guildBoosterFactor;

    const { currentXp, currentLevel, nextLevel, xpProgress, xpForLevel } = xpToNextLevel(xp)

    const guildBoostPercent = (timeElapsedFactor(member?.premiumSince, 7) * boosterFactor) * 100
    const tagBoostPercent = (timeElapsedFactor(user?.tagAssignedAt, 14) * tagSupporterFactor) * 100

    const guildHasTag = guild.features.find((f) => f === GuildFeature.GuildTags);

    const fields = [
        {
            name: 'Niveau',
            value: `**${currentLevel.toLocaleString('en')}** ➜ **${nextLevel.toLocaleString('en')}**`,
            inline: true
        },
        {
            name: 'Progression',
            value: [
                createProgressBar(Math.max(0, xpProgress / xpForLevel), { length: 7, asciiChar: true, showPercentage: true }),
                `**${xpProgress.toLocaleString('en')}** / **${xpForLevel.toLocaleString('en')}** XP`
            ].join('\n'),
            inline: true
        },
        {
            name: 'Rang',
            value: xp > 0 && leaderboard
                ? `**${leaderboard.rank.toLocaleString('en')}** / **${leaderboard.total.toLocaleString('en')}**`
                : 'Non Classé',
            inline: true
        },
        {
            name: "Total d'XP",
            value: currentXp.toLocaleString('en')
        },
    ];

    if (tagBoostPercent || tagSupporterFactor) {
        fields.push({
            name: 'Boosts',
            value: [
                boosterFactor && '- '.concat(createBoostLine({
                    label: 'Boost du serveur',
                    value: guildBoostPercent,
                    max: boosterFactor * 100,
                    arrowColor: 'green'
                })),
                (tagSupporterFactor && guildHasTag) && '- '.concat(createBoostLine({
                    label: 'Tag du serveur',
                    value: tagBoostPercent,
                    max: tagSupporterFactor * 100,
                    arrowColor: 'green'
                })),
            ].filter(Boolean).join('\n ')
        })
    }

    return EmbedUI.create({
        color: memberAvatarDominantColor,
        thumbnail: { url: memberAvatar },
        title: `${memberHelper.getName({ safe: true })} — Expérience`,
        description: '> 💡 Seuls les membres avec de l’XP sont pris en compte dans le classement !',
        fields,
        footer: {
            iconURL: member.guild.iconURL() ?? undefined,
            text: member.guild.name
        },
        timestamp: Date.now()
    });
};

export default new Command({
    description: "🧪 Display a member's progression",
    descriptionLocalizations: {
        fr: "🧪 Afficher la progression d'un membre"
    },
    access: {
        guild: {
            modules: {
                level: { isEnabled: true }
            }
        }
    },
    slashCommand: {
        arguments: [
            {
                type: ApplicationCommandOptionType.User,
                name: 'member',
                description: 'member',
                name_localizations: {
                    fr: 'membre'
                },
                description_localizations: {
                    fr: 'membre'
                }
            }
        ]
    },
    async onInteraction(interaction) {
        await interaction.deferReply();

        const member = interaction.options.getMember('member') ?? interaction.member;

        return await interaction.editReply({
            allowedMentions: {},
            embeds: [await buildEmbed(member)],
        });
    },
    async onMessage(message, { args: [userId] }) {
        const member = (userId
            ? message.guild.members.cache.get(parseUserMention(userId) ?? userId) ?? message.member
            : message.member) as GuildMember;

        return await message.reply({
            allowedMentions: {},
            embeds: [await buildEmbed(member)],
        });
    }
});
