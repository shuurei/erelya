import { randomBytes } from 'node:crypto'

export const AURA_COOLDOWN = 60 * 60 * 1000;
export const AURA_ROLL_LIMIT = 10;
export const AURA_ROLL_PRICE = 5000;

export const LUCK_POTIONS = {
    little: { name: 'Petite', luck: 2, rolls: 3, price: 5000 },
    high: { name: 'Grande', luck: 5, rolls: 5, price: 15000 },
    big: { name: 'Grosse', luck: 8, rolls: 8, price: 27500 },
    gourd: { name: 'Gourde du brave', luck: 10, rolls: 10, price: 40000 },
    heavenly: { name: 'Heavenly', luck: 1000, rolls: 1, price: 25000 },
    godly: { name: 'Godly', luck: 50000, rolls: 1, price: 50000 },
    monthly: { name: 'Monthly', luck: 75000, rolls: 1, price: 500000 }
} as const;

export type LuckPotion = keyof typeof LUCK_POTIONS;

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

export const selectAura = <T extends { chance: string }>(auras: T[], luck = 1, biomeBonus: (aura: T) => number = () => 1): T => {
    if (!auras.length || !Number.isSafeInteger(luck) || luck < 1) {
        throw new Error('Catalogue ou luck invalide');
    }

    const sorted = auras.map(aura => {
        if (!/^[1-9]\d{0,999}$/.test(aura.chance)) {
            throw new Error('Rareté invalide.');
        }

        return { aura, odds: BigInt(aura.chance) };
    }).sort((a, b) => a.odds > b.odds ? -1 : a.odds < b.odds ? 1 : 0);

    const denominator = sorted.reduce((d, { odds }) => d / gcd(d, odds) * odds, 1n);
    let remaining = denominator;

    const ticket = randomBelow(denominator);

    let cumulative = 0n;

    for (let i = 0; i < sorted.length; i++) {
        const { aura, odds } = sorted[i];
        const weight = i === sorted.length - 1 ? remaining : denominator / odds * BigInt(luck) * BigInt(biomeBonus(aura));
        const allocated = weight > remaining ? remaining : weight;
        
        remaining -= allocated;
        cumulative += allocated;

        if (ticket < cumulative) {
            return aura;
        }
    }

    throw new Error('Catalogue invalide.');
}

export const formatAuraChance = (chance: string) => {
    return `**\`1\`** chance sur **\`${BigInt(chance).toLocaleString('fr-FR')}\`**`;
}
