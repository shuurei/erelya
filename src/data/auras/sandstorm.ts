import { Biomes } from '../biomes'

export const sandstormAuras = {
    GILDED: {
        name: 'Gilded',
        chance: 512n,
        description: 'Une poussière d’or recouvre votre passage et transforme chaque pas en trésor',
        biome: Biomes.SANDSTORM
    },
    JACKPOT: {
        name: 'Jackpot',
        chance: 777n,
        description: 'Des étincelles de fortune jaillissent autour de vous au rythme d’une victoire éclatante',
        biome: Biomes.SANDSTORM
    },
    NEFERKHAF: {
        name: 'Neferkhaf',
        chance: 1_000n,
        description: 'Les sables anciens tourbillonnent autour d’un sceau royal arraché à l’oubli',
        biome: Biomes.SANDSTORM
    },
    ANUBIS: {
        name: 'Anubis',
        chance: 7_200_000n,
        description: 'Des sables noirs dessinent une balance silencieuse où reposent les secrets des âmes',
        biome: Biomes.SANDSTORM
    },
    ATLAS: {
        name: 'ATLAS',
        chance: 360_000_000n,
        description: 'Une voûte d’astres repose sur votre aura, soutenue par une force d’une patience infinie',
        biome: Biomes.SANDSTORM
    },
    DUNEPHARAOH: {
        name: 'DUNE : PHARAOH',
        chance: 72_000_000n,
        description: 'Des sables dorés reconstruisent le trône d’un souverain oublié',
        biome: Biomes.SANDSTORM
    },
    MIRAGESUNDIAL: {
        name: 'MIRAGE : SUNDIAL',
        chance: 3_600_000_000n,
        description: 'Les mirages de votre aura mesurent les heures d’un soleil disparu',
        biome: Biomes.SANDSTORM
    }
} as const
