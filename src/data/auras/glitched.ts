import { Biomes } from '../biomes'

export const glitchedAuras = {
    FAULT: {
        name: 'FAULT',
        chance: 3_000n,
        description: 'Une faille traverse votre lumière et laisse entrevoir les rouages brisés de la réalité',
        biome: Biomes.GLITCHED
    },
    GLITCH: {
        name: 'GLITCH',
        chance: 12_210_110n,
        description: 'Des fragments de réalité sautent et se répètent autour de vous comme une image corrompue',
        biome: Biomes.GLITCHED
    },
    FATALERROR: {
        name: 'FATAL ERROR',
        chance: 40_413_000n,
        description: 'Des alertes écarlates fissurent l’espace et annoncent une défaillance que nul ne peut arrêter',
        biome: Biomes.GLITCHED
    },
    OPPRESSION: {
        name: '[OPPRESSION]',
        chance: 220_000_000n,
        description: 'Une pression invisible s’abat autour de vous et réduit chaque éclat à un silence pesant',
        biome: Biomes.GLITCHED
    },
    GLITCHPARADOX: {
        name: 'GLITCH : PARADOX',
        chance: 33_333_333n,
        description: 'Vos mouvements précèdent leur propre cause dans une cascade d’erreurs',
        biome: Biomes.GLITCHED
    },
    FATALRECURSION: {
        name: 'FATAL : RECURSION',
        chance: 999_999_999n,
        description: 'Une boucle écarlate répète la dernière seconde d’un univers brisé',
        biome: Biomes.GLITCHED
    }
} as const
