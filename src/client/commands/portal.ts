import { Command } from '@/structures/Command'

import { GuildMemberService } from '@/database/services/guild-member.service'
import { GuildModuleService } from '@/database/services/guild-module.service'
import { GuildPortalService } from '@/database/services/guild-portal.service'
import { GuildPortal, PortalType } from '@/database/entities/guild-portals.entity'

import { handleGuildPortalGeneration } from '../handlers/guild-portal-generation-sync'
import { handleMemberCheckLevelUp } from '../handlers/member-check-level-up'

import { createActionRow, createButton, createStringSelectMenu } from '@/ui/components/common'
import { createProgressBar } from '@/ui/components'
import { EmbedUI } from '@/ui'

import { applicationEmojiHelper, guildMemberHelper } from '@/helpers'
import { getDominantColor, tzMap } from '@/utils'
import { DateTime } from 'luxon'

const MAX_DAILY_PORTAL_ENTRIES = 3;

const getPortalEmoji = (type: PortalType) => {
    switch (type) {
        case PortalType.GREEN: return '🌱';
        case PortalType.YELLOW: return '💰';
        case PortalType.BLUE: return '🧭';
        case PortalType.RED: return '🔥';
    }
}

const getPortalName = (type: PortalType) => {
    switch (type) {
        case PortalType.GREEN: return "Portail de Croissance";
        case PortalType.YELLOW: return "Portail de Richesse";
        case PortalType.BLUE: return "Portail d'Exploration";
        case PortalType.RED: return "Portail de Conquête";
    }
}

const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const remainingSecondsAfterHours = seconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);

    const remainingSeconds = remainingSecondsAfterHours % 60;

    const parts = [];

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}min`);
    }

    if (remainingSeconds > 0) {
        parts.push(`${remainingSeconds}s`);
    }

    return parts.length > 0 ? parts.join(' ') : null;
}

export default new Command({
    nameLocalizations: { fr: 'portails' },
    description: '🌀 View available portals',
    descriptionLocalizations: { fr: '🌀 Consulte les portails disponibles' },
    access: {
        guild: {
            modules: {
                economy: { isEnabled: true },
                level: { isEnabled: true }
            }
        }
    },
    async onInteraction(interaction) {
        await interaction.deferReply()

        const guild = interaction.guild
        const guildId = guild.id
        const member = interaction.member
        const userId = member.user.id

        const { whiteArrowEmoji } = applicationEmojiHelper();

        const memberHelper = await guildMemberHelper(member, { fetchAll: true });
        const memberAvatarDominantColor = await getDominantColor(memberHelper.getAvatarURL({ forceStatic: true }));

        const [guildEcoModule, guildLevelModule] = await Promise.all([
            GuildModuleService.findOrCreate(guildId, 'economy'),
            GuildModuleService.findOrCreate(guildId, 'level')
        ]);

        const formatRewards = (portal: GuildPortal) => {
            const rewards = []

            if (guildLevelModule?.isEnabled && portal.xpReward) {
                rewards.push(`- 🧪 XP ${whiteArrowEmoji} **${portal.xpReward.toLocaleString('en')}**`);
            }

            if (guildEcoModule?.isEnabled && portal.coinReward) {
                rewards.push(`- :coin: Pièces de serveur ${whiteArrowEmoji} **${portal.coinReward.toLocaleString('en')}**`);
            }

            return rewards.join('\n');
        }

        const getActivePortal = async () => {
            return await GuildPortalService.findByUser({ guildId, userId });
        }

        const renderActivePortal = (portal: GuildPortal) => {
            const { isCompleted, progress } = portal

            const fields = [
                {
                    name: 'Progression',
                    value: [
                        `**${Math.floor(progress * 100)}%**`,
                        createProgressBar(progress, { length: 10, asciiChar: true, showPercentage: false })
                    ].join('\n'),
                    inline: true
                },

                {
                    name: 'Temps restant',
                    value: portal.remainingTime <= 0 ? 'Aucun' : `⏱️ **${formatDuration(portal.remainingTime)}**`,
                    inline: true
                },
                {
                    name: 'Récompenses',
                    value: formatRewards(portal),
                    inline: false
                }
            ];

            const payload = {
                color: memberAvatarDominantColor,
                thumbnail: { url: memberHelper.getAvatarURL() },
                title: `${getPortalEmoji(portal.type)} ${getPortalName(portal.type)} - #${portal.id}`,
                description: isCompleted
                    ? '> ✨ **Le portail est terminé !** Réclame tes récompenses !'
                    : '> Tu es actuellement à l’intérieur de ce portail',
                fields,
                footer: { text: "Fin de l’exploration à la fin du temps imparti" }
            }

            const button = createButton('Terminé', {
                color: 'green',
                customId: `portal:complete:${portal.id}`
            });

            return {
                embeds: [EmbedUI.create(payload)],
                components: isCompleted ? [createActionRow([button])] : []
            } as const
        }

        const renderPortalList = async () => {
            const { portalEntriesToday } = await GuildMemberService.findById({ userId, guildId }) ?? { portalEntriesToday: 0 };

            const portals = await GuildPortalService.findByGuild({ guildId });
            const availablePortals = portals.filter((portal) => !portal.userId);

            const payload = {
                color: memberAvatarDominantColor,
                thumbnail: { url: guild.iconURL() ?? '' },
                title: 'Portails',
                description: availablePortals.length
                    ? [
                        '**Des portails sont apparus !**',
                        '> *Choisis-en un pour commencer ton expédition*'
                    ].join('\n')
                    : [
                        "**Aucun portail à l'horizon, profites-en pour te reposer !**",
                        '> *De nouveaux portails apparaîtront prochainement*'
                    ].join('\n'),
                fields: availablePortals.map((portal) => ({
                    name: `${getPortalEmoji(portal.type)} ${getPortalName(portal.type)} - #${portal.id}`,
                    value: [
                        formatRewards(portal),
                        `- ⏳ Expiration ${whiteArrowEmoji} **${formatDuration(portal.expiringTime)}**`,
                        `- ⏱️ Durée ${whiteArrowEmoji} **${formatDuration(portal.duration * 60)}**`
                    ].filter(Boolean).join('\n'),
                    inline: false
                })),
                footer: { text: `Limite quotidienne ${portalEntriesToday}/${MAX_DAILY_PORTAL_ENTRIES}` }
            }

            const selectMenu = availablePortals.length > 0 ? createStringSelectMenu({
                options: availablePortals.map(({ id, type, duration }) => ({
                    label: `#${id} - ${getPortalName(type)}`,
                    description: `⏱️ Durée ${formatDuration(duration * 60)}`,
                    emoji: getPortalEmoji(type),
                    value: id.toString()
                })),
                customId: 'portal:select'
            }) : null

            return {
                embeds: [EmbedUI.create(payload)],
                components: selectMenu && portalEntriesToday < MAX_DAILY_PORTAL_ENTRIES ? [createActionRow([selectMenu])] : []
            } as const
        }

        const activePortal = await getActivePortal();
        if (!activePortal) {
            await handleGuildPortalGeneration(guildId);
        }

        const { portalEntriesToday, lastPortalEntryAt } = await GuildMemberService.findById({ userId, guildId }) ?? { portalEntriesToday: 0, lastPortalEntryAt: null };

        const guildLocale = member.guild.preferredLocale;
        const guildTZ = tzMap[guildLocale] || 'UTC';

        const now = DateTime.now().setZone(guildTZ);
        const last = lastPortalEntryAt ? DateTime.fromJSDate(lastPortalEntryAt, { zone: guildTZ }) : null;
        const isSameDay = last ? last.hasSame(now, 'day') : false;

        if ((portalEntriesToday >= 0) && !isSameDay) {
            await GuildMemberService.resetportalEntriesToday({ guildId, userId });
        }

        const msg = await interaction.editReply(activePortal ? renderActivePortal(activePortal) : await renderPortalList());

        const collector = msg.createMessageComponentCollector({
            filter: ({ user }) => user.id === userId,
            time: 120_000
        });

        collector.on('collect', async (i) => {
            if (i.isStringSelectMenu() && i.customId === 'portal:select') {
                const existingPortal = await getActivePortal()
                if (existingPortal) {
                    return await i.reply({ content: 'Mhh..' });
                }

                const portalId = +i.values[0]
                const portal = await GuildPortalService.findById({ id: portalId });

                if (!portal) {
                    return await i.reply({
                        content: 'On dirait bien que ce portail a disparu..'
                    });
                }

                if (portal.userId) {
                    return await i.reply({
                        content: "Ce portail s'est refermé après qu'un autre utilisateur soit déjà entré",
                    });
                }

                const assignedPortal = await GuildPortalService.assign(portalId, userId);
                if (!assignedPortal) {
                    return await i.reply({
                        content: "Mhh.. On dirait bien que le portail ne veut pas de toi.."
                    });
                }

                return await i.update(renderActivePortal(assignedPortal));
            }

            if (i.isButton() && i.customId.startsWith('portal:complete:')) {
                const portalId = +i.customId.split(':')[2];
                const portal = await GuildPortalService.findById({ id: portalId });

                if (!portal || portal.userId !== userId) {
                    return await i.reply({
                        content: 'Ce portail a disparu',
                    });
                }

                await GuildPortalService.complete(portal.id);

                if (guildEcoModule?.isEnabled && portal.coinReward) {
                    await GuildMemberService.addCoins({ guildId, userId }, portal.coinReward);
                }

                if (guildLevelModule?.isEnabled && portal.xpReward) {
                    await handleMemberCheckLevelUp({
                        member,
                        channel: interaction.channel,
                        xpGain: portal.xpReward
                    });
                }

                return await i.update(await renderPortalList());
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'time') return;

            try {
                await msg.edit({
                    content: '',
                    embeds: [
                        EmbedUI.createMessage({
                            color: 'orange',
                            description: '**2 minutes** se sont écoulées sans interaction 💡'
                        })
                    ],
                    components: []
                });
            } catch (error: any) {
                if (error?.code === 10008) return;

                throw error;
            }
        });
    }
})