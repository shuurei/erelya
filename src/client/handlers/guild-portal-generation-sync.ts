import { PortalType } from '@/database/entities/guild-portals.entity'
import { GuildPortalService } from '@/database/services/guild-portal.service'
import { GuildService } from '@/database/services/guild.service'
import { In } from 'typeorm';

const MAX_PORTALS = 6;

const MIN_GENERATION_INTERVAL = 30 * 60 * 1000;
const MAX_GENERATION_INTERVAL = 45 * 60 * 1000;

const PORTALS = {
    [PortalType.GREEN]: {
        xpReward: 2500,
        coinReward: 0,
        duration: 20
    },
    [PortalType.YELLOW]: {
        xpReward: 0,
        coinReward: 15000,
        duration: 20
    },
    [PortalType.BLUE]: {
        xpReward: 3250,
        coinReward: 17500,
        duration: 30
    },
    [PortalType.RED]: {
        xpReward: 4250,
        coinReward: 27500,
        duration: 60
    }
} satisfies Record<PortalType, {
    xpReward: number;
    coinReward: number;
    duration: number;
}>

const generatePortalType = (): PortalType => {
    const types = Object.values(PortalType);

    return types[Math.floor(Math.random() * types.length)];
}

const getRandomGenerationInterval = () => {
    return Math.floor(Math.random() * (MAX_GENERATION_INTERVAL - MIN_GENERATION_INTERVAL + 1)) + MIN_GENERATION_INTERVAL;
}

const generatePortal = (guildId: string) => {
    const type = generatePortalType();
    const stats = PORTALS[type];

    return GuildPortalService.create(guildId, { type, ...stats });
}

const generatePortals = async (guildId: string) => {
    const portals = await GuildPortalService.findByGuild({ guildId });
    const activePortals = portals.filter((portal) => !portal.isCompleted);

    const remaining = MAX_PORTALS - activePortals.length
    if (remaining <= 0) {
        return activePortals
    }

    const amount = Math.min(Math.floor(Math.random() * 5) + 2, remaining);
    const newPortals = await Promise.all(Array.from({ length: amount }, () => generatePortal(guildId)));

    await GuildService.update(guildId, {
        nextPortalGenerationAt: new Date(Date.now() + getRandomGenerationInterval())
    });

    return [
        ...activePortals,
        ...newPortals
    ];
}

export async function handleGuildPortalGeneration(guildId: string) {
    const guild = await GuildService.findOrCreate(guildId);
    const portals = await GuildPortalService.findByGuild({ guildId });

    const expiredPortals = portals.filter((portal) => portal.isExpired);
    if (expiredPortals.length > 0) {
        await GuildService.repo.delete({ id: In(expiredPortals.map(({ id }) => id)) });
    }

    const activePortals = portals.filter((portal) => !portal.isCompleted);
    if (activePortals.length >= MAX_PORTALS) {
        return activePortals;
    }

    if (guild.nextPortalGenerationAt && guild.nextPortalGenerationAt > new Date()) {
        return activePortals;
    }

    return generatePortals(guildId);
}