import { Biomes } from '../biomes'

export const cyberspaceAuras = {
    VIRTUAL: {
        name: 'Virtual',
        chance: 2_500_000n,
        description: 'Une grille lumineuse superpose au monde réel les promesses d’un univers numérique',
        biome: Biomes.CYBERSPACE
    },
    MATRIX: {
        name: 'Matrix',
        chance: 50_000_000n,
        description: 'Des lignes géométriques dévoilent la trame cachée sur laquelle repose le monde',
        biome: Biomes.CYBERSPACE
    },
    VIRTUALWORLDWIDE: {
        name: 'Virtual : WorldWide',
        chance: 87_500_000n,
        description: 'Un réseau de lumières relie votre présence à des horizons numériques sans fin',
        biome: Biomes.CYBERSPACE
    },
    MATRIXOVERDRIVE: {
        name: '{♢ MATRIX /◆ OVERDRIVE ♢}',
        chance: 503_000_000n,
        description: 'La trame du monde accélère jusqu’à l’incandescence, portée au-delà de ses limites',
        biome: Biomes.CYBERSPACE
    },
    MATRIXREALITY: {
        name: 'MATRIX ▫ REALITY',
        chance: 601_020_102n,
        description: 'Les lignes du possible s’assemblent autour de vous et donnent forme à une réalité nouvelle',
        biome: Biomes.CYBERSPACE
    },
    PIXELATION: {
        name: '▣ PIXELATION ▣',
        chance: 1_073_741_824n,
        description: 'Le monde se fragmente en carrés de lumière et se recompose selon votre propre résolution',
        biome: Biomes.CYBERSPACE
    },
    CYBERNEONGOD: {
        name: 'CYBER : NEON GOD',
        chance: 6_010_201_020n,
        description: 'Des cathédrales de néon s’élèvent dans un réseau qui bat à votre rythme',
        biome: Biomes.CYBERSPACE
    }
} as const
