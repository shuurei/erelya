import { In } from 'typeorm'

import { PortalRank } from '@/database/entities/guild-portals.entity'
import { GuildPortalService } from '@/database/services/guild-portal.service'
import { GuildService } from '@/database/services/guild.service'

const MAX_PORTALS = 5;

const MIN_GENERATION_INTERVAL = 45 * 60 * 1000;
const MAX_GENERATION_INTERVAL = 1.5 * 60 * 60 * 1000;

const RANK_CONFIG = {
    [PortalRank.E]: {
        chance: 35,
        baseDuration: 20,
        durationVariation: 0.2,
        rewardMultiplier: 0.6
    },
    [PortalRank.D]: {
        chance: 25,
        baseDuration: 30,
        durationVariation: 0.2,
        rewardMultiplier: 0.8
    },
    [PortalRank.C]: {
        chance: 18,
        baseDuration: 45,
        durationVariation: 0.2,
        rewardMultiplier: 1
    },
    [PortalRank.B]: {
        chance: 12,
        baseDuration: 60,
        durationVariation: 0.2,
        rewardMultiplier: 1.4
    },
    [PortalRank.A]: {
        chance: 7,
        baseDuration: 120,
        durationVariation: 0.2,
        rewardMultiplier: 1.8
    },
    [PortalRank.S]: {
        chance: 2.5,
        baseDuration: 240,
        durationVariation: 0.2,
        rewardMultiplier: 2
    },
    [PortalRank.N]: {
        chance: 0.5,
        baseDuration: 1440,
        durationVariation: 0.2,
        rewardMultiplier: 2.2
    },
} satisfies Record<PortalRank, {
    chance: number;
    baseDuration: number;
    durationVariation: number;
    rewardMultiplier: number;
}>

const RANK_REWARDS = {
    [PortalRank.E]: {
        xp: 4_000,
        coins: 5_000
    },
    [PortalRank.D]: {
        xp: 6_000,
        coins: 10_000
    },
    [PortalRank.C]: {
        xp: 8_500,
        coins: 20_000
    },
    [PortalRank.B]: {
        xp: 10_000,
        coins: 40_000
    },
    [PortalRank.A]: {
        xp: 12_000,
        coins: 60_000
    },
    [PortalRank.S]: {
        xp: 14_000,
        coins: 80_000
    },
    [PortalRank.N]: {
        xp: 16_000,
        coins: 100_000
    },
} satisfies Record<PortalRank, {
    xp: number;
    coins: number;
}>

export const generatePortalRank = (): PortalRank => {
    const roll = Math.random() * 100;
    let cumulative = 0;

    for (const rank of Object.values(PortalRank)) {
        cumulative += RANK_CONFIG[rank].chance;

        if (roll < cumulative) {
            return rank;
        }
    }

    return PortalRank.E
}

export const generatePortalDuration = (rank: PortalRank): number => {
    const config = RANK_CONFIG[rank];
    const variation = config.durationVariation;

    const minDuration = config.baseDuration * (1 - variation);
    const maxDuration = config.baseDuration * (1 + variation);

    return Math.floor(minDuration + Math.random() * (maxDuration - minDuration + 1));
}


export const getPortalRewards = (rank: PortalRank, expectedDuration: number) => {
    if (!Number.isFinite(expectedDuration) || expectedDuration < 0) {
        throw new RangeError('expectedDuration must be postive number or null');
    }

    const config = RANK_CONFIG[rank];
    const baseRewards = RANK_REWARDS[rank];

    const durationMultiplier = expectedDuration / config.baseDuration;

    return {
        xpReward: Math.floor(baseRewards.xp * config.rewardMultiplier * durationMultiplier),
        coinReward: Math.floor(baseRewards.coins * config.rewardMultiplier * durationMultiplier)
    }
}

const generatePortalStats = (rank: PortalRank) => {
    if (rank === PortalRank.N || rank === PortalRank.S || rank === PortalRank.A) {
        return {
            hasCoinReward: true,
            hasXpReward: true,
            isStatsHidden: false
        }
    }

    if (Math.random() < 0.03) {
        return {
            hasCoinReward: false,
            hasXpReward: false,
            isStatsHidden: true
        }
    }

    const roll = Math.random();
    if (roll < 0.25) {
        return {
            hasCoinReward: true,
            hasXpReward: false,
            isStatsHidden: false
        }
    }

    if (roll < 0.5) {
        return {
            hasCoinReward: false,
            hasXpReward: true,
            isStatsHidden: false
        }
    }

    return {
        hasCoinReward: true,
        hasXpReward: true,
        isStatsHidden: false
    }
}

const getRandomGenerationInterval = () => {
    return Math.floor(Math.random() * (MAX_GENERATION_INTERVAL - MIN_GENERATION_INTERVAL + 1)) + MIN_GENERATION_INTERVAL;
}

const generatePortal = (guildId: string) => {
    const rank = generatePortalRank();
    const duration = generatePortalDuration(rank);
    const stats = generatePortalStats(rank);

    return GuildPortalService.create(guildId, {
        rank,
        duration,
        ...stats
    });
}

const generatePortals = async (guildId: string) => {
    const portals = await GuildPortalService.findByGuild({ guildId })

    const activePortals = portals.filter((portal) =>
        !portal.isCompleted &&
        !portal.isExpired &&
        !portal.userId
    );

    const remaining = MAX_PORTALS - activePortals.length;
    if (remaining <= 0) {
        return activePortals;
    }

    const amount = Math.min(Math.floor(Math.random() * 5) + 2, remaining);
    const newPortals = await Promise.all(Array.from({ length: amount }, () => generatePortal(guildId)));

    await GuildService.setNextPortalGenerationAt(guildId, new Date(Date.now() + getRandomGenerationInterval()));

    return [...activePortals, ...newPortals];
}

export async function handleGuildPortalGeneration(guildId: string) {
    const guild = await GuildService.findOrCreate(guildId);
    const portals = await GuildPortalService.findByGuild({ guildId });

    const expiredPortals = portals.filter(portal => portal.isExpired);

    if (expiredPortals.length > 0) {
        await GuildPortalService.repo.delete({ id: In(expiredPortals.map(({ id }) => id)) });
    }

    const activePortals = portals.filter((portal) =>
        !portal.isCompleted &&
        !portal.isExpired &&
        !portal.userId
    );

    if (activePortals.length >= MAX_PORTALS) {
        return activePortals;
    }

    if (guild.nextPortalGenerationAt && guild.nextPortalGenerationAt > new Date()) {
        return activePortals;
    }

    return generatePortals(guildId);
}