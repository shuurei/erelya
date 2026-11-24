import type { AuraKey } from './auras'

type AuraEffect = {
    readonly coinflipMaxBet: number;
};

const auraEffects: ReadonlyMap<string, AuraEffect> = new Map<AuraKey, AuraEffect>([
    ['JACKPOT', { coinflipMaxBet: 10_000_000 }]
]);

export const getAuraEffect = (key?: string | null) => key ? auraEffects.get(key) : undefined;
