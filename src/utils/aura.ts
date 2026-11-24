import { randomBytes } from 'node:crypto'

export const AURA_COOLDOWN = 60 * 60 * 1000;
export const AURA_ROLL_LIMIT = 10;
export const AURA_BONUS_ROLL_MULTIPLIER = 2;
const BASE_LUCK_PERCENT = 100;

export const LUCK_POTIONS = {
    little: { name: 'Potion de chance', storedLuck: 2, bonusPercent: 25, rolls: 3, price: 5000 },
    high: { name: 'Potion de fortune I', storedLuck: 5, bonusPercent: 50, rolls: 5, price: 15000 },
    big: { name: 'Potion de fortune II', storedLuck: 8, bonusPercent: 75, rolls: 8, price: 27500 },
    gourd: { name: 'Potion de fortune III', storedLuck: 10, bonusPercent: 100, rolls: 10, price: 40000 },
    heavenly: { name: 'Élixir céleste', storedLuck: 1000, bonusPercent: 250, rolls: 1, price: 25000 },
    godly: { name: 'Élixir divin', storedLuck: 50000, bonusPercent: 500, rolls: 1, price: 50000 },
    monthly: { name: 'Élixir lunaire', storedLuck: 75000, bonusPercent: 750, rolls: 1, price: 500000 }
} as const;

export type LuckPotion = keyof typeof LUCK_POTIONS;

type PotionConfig = (typeof LUCK_POTIONS)[LuckPotion];
const potionsByStoredLuck = new Map<number, PotionConfig>(Object.values(LUCK_POTIONS).map(potion => [potion.storedLuck, potion]));

export const activeLuckPotion = (storedLuck: number, rollsRemaining: number) =>
    rollsRemaining > 0 ? potionsByStoredLuck.get(storedLuck) : undefined;

export const auraLuckPercent = (gloveBonusPercent = 0, potion?: PotionConfig, bonusRoll = false) => {
    const potionBonus = potion?.bonusPercent ?? 0;
    const specialBonus = potion?.rolls === 1 ? potionBonus : 0;
    const basicLuck = BASE_LUCK_PERCENT + gloveBonusPercent + potionBonus - specialBonus;
    return basicLuck * (bonusRoll ? AURA_BONUS_ROLL_MULTIPLIER : 1) + specialBonus;
};

export const isAuraBonusRoll = (rollsUsed: number) => rollsUsed + 1 === AURA_ROLL_LIMIT;

const gcd = (a: bigint, b: bigint) => {
    while (b) {
        [a, b] = [b, a % b];
    }

    return a;
}

const randomBelow = (max: bigint) => {
    if (max === 1n) {
        return 0n;
    }

    const bits = (max - 1n).toString(2).length;
    const bytes = Math.ceil(bits / 8);

    while (true) {
        const buffer = randomBytes(bytes);
        buffer[0] &= 0xff >>> (bytes * 8 - bits);
        const value = BigInt(`0x${buffer.toString('hex')}`);
        
        if (value < max) {
            return value;
        }
    }
}

export const selectAura = <T extends { chance: bigint }>(auras: readonly T[], luckPercent = BASE_LUCK_PERCENT, biomeBonus: (aura: T) => number = () => 1): T => {
    if (!auras.length || !Number.isSafeInteger(luckPercent) || luckPercent < BASE_LUCK_PERCENT) {
        throw new Error('Catalogue ou luck invalide');
    }

    const sorted = auras.map(aura => {
        if (aura.chance < 1n) {
            throw new Error('Rareté invalide.');
        }

        return { aura, odds: aura.chance };
    }).sort((a, b) => a.odds > b.odds ? -1 : a.odds < b.odds ? 1 : 0);

    const denominator = sorted.reduce((d, { odds }) => d / gcd(d, odds) * odds, 1n) * BigInt(BASE_LUCK_PERCENT);
    let remaining = denominator;

    const ticket = randomBelow(denominator);

    let cumulative = 0n;

    for (let i = 0; i < sorted.length; i++) {
        const { aura, odds } = sorted[i];
        const weight = i === sorted.length - 1 ? remaining : denominator / odds / BigInt(BASE_LUCK_PERCENT) * BigInt(luckPercent) * BigInt(biomeBonus(aura));
        const allocated = weight > remaining ? remaining : weight;
        
        remaining -= allocated;
        cumulative += allocated;

        if (ticket < cumulative) {
            return aura;
        }
    }

    throw new Error('Catalogue invalide.');
}

export const formatAuraChance = (chance: bigint) => {
    return `**\`1\`** chance sur **\`${chance.toLocaleString('fr-FR')}\`**`;
}
