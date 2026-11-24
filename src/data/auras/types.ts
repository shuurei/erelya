import type { Biomes } from '../biomes'

type BiomeName = (typeof Biomes)[keyof typeof Biomes]

type AuraBase = {
    readonly name: string;
    readonly description: string;
};

export type RollableAura = AuraBase & {
    readonly chance: bigint;
    readonly biome: BiomeName;
};

export type SpecialAura = AuraBase & {
    readonly chance: null;
    readonly biome: null;
};

export type Aura = RollableAura | SpecialAura;
