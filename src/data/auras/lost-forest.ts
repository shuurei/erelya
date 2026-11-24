import { Biomes } from '../biomes'

export const lostForestAuras = {
    NATURAL: {
        name: 'Natural',
        chance: 8n,
        description: 'Le souffle des sous-bois vous enveloppe de feuilles et de parfums de terre humide',
        biome: Biomes.LOSTFOREST
    },
    FLORA: {
        name: 'Flora',
        chance: 3_700n,
        description: 'Des pétales s’ouvrent à votre passage, nourris par une énergie douce et sauvage',
        biome: Biomes.LOSTFOREST
    },
    RUNIC: {
        name: 'Runic',
        chance: 50_000_000n,
        description: 'Des inscriptions antiques s’illuminent à votre passage et réveillent une langue de puissance',
        biome: Biomes.LOSTFOREST
    },
    RUINS: {
        name: '《 Ruins 》',
        chance: 500_000_000n,
        description: 'Les vestiges d’un empire oublié se dressent dans votre aura, encore habités de grandeur',
        biome: Biomes.LOSTFOREST
    },
    RUINSWITHERED: {
        name: '《 ⬥ Ruins : Withered ⬥ 》',
        chance: 800_000_000n,
        description: 'Des racines desséchées enlacent les restes d’un royaume dont la gloire refuse de mourir',
        biome: Biomes.LOSTFOREST
    },
    VERDANTANCESTRY: {
        name: 'VERDANT : ANCESTRY',
        chance: 37_000_000n,
        description: 'Des racines de lumière relient votre souffle aux premières forêts',
        biome: Biomes.LOSTFOREST
    }
} as const
