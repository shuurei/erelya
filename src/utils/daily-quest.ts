export type QuestValue = {
    rewards: {
        guildCoins?: number;
        activityXp?: number;
    };
    value: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic';
};

export const RARITY_BONUS: Record<QuestValue['rarity'], number> = {
    common: 1,
    uncommon: 1.2,
    rare: 1.3,
    epic: 1.4
};

export const VOICE_POOL: QuestValue[] = [
    // COMMON
    {
        rarity: 'common',
        value: 10,
        rewards: {
            guildCoins: 900,
            activityXp: 350
        }
    },
    {
        rarity: 'common',
        value: 15,
        rewards: {
            guildCoins: 1250,
            activityXp: 500
        }
    },
    {
        rarity: 'common',
        value: 20,
        rewards: {
            guildCoins: 1400,
            activityXp: 550
        }
    },
    {
        rarity: 'common',
        value: 25,
        rewards: {
            guildCoins: 1550,
            activityXp: 600
        }
    },
    {
        rarity: 'common',
        value: 35,
        rewards: {
            guildCoins: 1750,
            activityXp: 700
        }
    },
    // UNCOMMON
    {
        rarity: 'uncommon',
        value: 45,
        rewards: {
            guildCoins: 2200,
            activityXp: 850
        }
    },
    {
        rarity: 'uncommon',
        value: 60,
        rewards: {
            guildCoins: 2600,
            activityXp: 950
        }
    },
    {
        rarity: 'uncommon',
        value: 75,
        rewards: {
            guildCoins: 3000,
            activityXp: 1100
        }
    },
    // RARE
    {
        rarity: 'rare',
        value: 90,
        rewards: {
            guildCoins: 4200,
            activityXp: 1300
        }
    },
    {
        rarity: 'rare',
        value: 120,
        rewards: {
            guildCoins: 5000,
            activityXp: 1600
        }
    },
    {
        rarity: 'rare',
        value: 150,
        rewards: {
            guildCoins: 6500,
            activityXp: 1900
        }
    },
    // EPIC
    {
        rarity: 'epic',
        value: 180,
        rewards: {
            guildCoins: 8000,
            activityXp: 2400
        }
    }
];

export const STREAMING_POOL: QuestValue[] = [
    // COMMON
    {
        rarity: 'common',
        value: 10,
        rewards: {
            guildCoins: 1350,
            activityXp: 525
        }
    },
    {
        rarity: 'common',
        value: 15,
        rewards: {
            guildCoins: 1875,
            activityXp: 750
        }
    },
    {
        rarity: 'common',
        value: 20,
        rewards: {
            guildCoins: 2100,
            activityXp: 825
        }
    },
    {
        rarity: 'common',
        value: 25,
        rewards: {
            guildCoins: 2325,
            activityXp: 900
        }
    },
    {
        rarity: 'common',
        value: 35,
        rewards: {
            guildCoins: 2625,
            activityXp: 1050
        }
    },
    // UNCOMMON
    {
        rarity: 'uncommon',
        value: 45,
        rewards: {
            guildCoins: 3300,
            activityXp: 1275
        }
    },
    {
        rarity: 'uncommon',
        value: 60,
        rewards: {
            guildCoins: 2600,
            activityXp: 950
        }
    },
    {
        rarity: 'uncommon',
        value: 75,
        rewards: {
            guildCoins: 3900,
            activityXp: 1650
        }
    },
    // RARE
    {
        rarity: 'rare',
        value: 90,
        rewards: {
            guildCoins: 6300,
            activityXp: 1950
        }
    },
    {
        rarity: 'rare',
        value: 120,
        rewards: {
            guildCoins: 7500,
            activityXp: 2400
        }
    },
    {
        rarity: 'rare',
        value: 150,
        rewards: {
            guildCoins: 9750,
            activityXp: 2850
        }
    },
    // EPIC
    {
        rarity: 'epic',
        value: 180,
        rewards: {
            guildCoins: 12000,
            activityXp: 3600
        }
    }
];

export const getRandomFromPool = (pool: QuestValue[]): QuestValue => {
    const weights: Record<QuestValue['rarity'], number> = {
        common: 40,
        uncommon: 30,
        rare: 20,
        epic: 10
    };

    const totalWeight = pool.reduce((sum, item) => sum + weights[item.rarity], 0);
    let roll = Math.random() * totalWeight;

    for (const item of pool) {
        roll -= weights[item.rarity];
        if (roll <= 0) return item;
    }

    return pool[0];
}

export const generateDailyQuest = (): Partial<Record<'voice' | 'streaming', QuestValue>> => {
    const isVoiceQuest = Math.random() < 0.5;

    return {
        [isVoiceQuest ? 'voice' : 'streaming']: getRandomFromPool(isVoiceQuest ? VOICE_POOL : STREAMING_POOL)
    }
}

export const calculateQuestBonusMultiplier = (quest: Partial<Record<'voice' | 'streaming', QuestValue>>) => {
    const current = quest.voice ? quest.voice : quest.streaming;

    return current ? RARITY_BONUS[current.rarity] : 0;
}