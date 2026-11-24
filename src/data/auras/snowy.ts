import { Biomes } from '../biomes'

export const snowyAuras = {
    GLACIER: {
        name: 'Glacier',
        chance: 2_304n,
        description: 'Une fraîcheur millénaire cristallise votre souffle et ralentit le tumulte du monde',
        biome: Biomes.SNOWY
    },
    PERMAFROST: {
        name: 'Permafrost',
        chance: 73_500n,
        description: 'Un givre immuable recouvre votre aura et conserve les secrets des terres gelées',
        biome: Biomes.SNOWY
    },
    WONDERLAND: {
        name: 'Wonderland',
        chance: 12_000_000n,
        description: 'Des flocons enchantés sculptent autour de vous un palais éphémère de silence et de givre',
        biome: Biomes.SNOWY
    },
    BLIZZARD: {
        name: 'Blizzard',
        chance: 27_315_000n,
        description: 'Une tempête blanche efface les distances et fait de votre silhouette son unique repère',
        biome: Biomes.SNOWY
    },
    CHILLSEAR: {
        name: 'CHILLSEAR',
        chance: 375_000_000n,
        description: 'Le froid et la brûlure se rencontrent dans une flamme pâle qui mord sans se consumer',
        biome: Biomes.SNOWY
    },
    FROSTBITEETERNITY: {
        name: 'FROSTBITE : ETERNITY',
        chance: 830_000_000n,
        description: 'Un givre bleu préserve dans votre aura un instant qui ne finira jamais',
        biome: Biomes.SNOWY
    },
    AURORAPRISM: {
        name: 'AURORA : PRISM',
        chance: 2_731_500_000n,
        description: 'Des voiles polaires se réfractent dans une constellation de cristaux',
        biome: Biomes.SNOWY
    }
} as const
