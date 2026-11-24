import { Biomes } from '../biomes'

export const singularityAuras = {
    COMET: {
        name: 'COMET',
        chance: 120_000n,
        description: 'Une comète miniature fend votre ciel et abandonne une longue chevelure de feu',
        biome: Biomes.SINGULARITY
    },
    COSMOS: {
        name: 'Cosmos',
        chance: 1_520_000n,
        description: 'Des galaxies minuscules gravitent dans votre aura, chacune gardienne d’un horizon inconnu',
        biome: Biomes.SINGULARITY
    },
    GRAVITATIONAL: {
        name: 'Gravitational',
        chance: 2_000_000n,
        description: 'La lumière elle-même se courbe autour de vous, attirée par un centre invisible',
        biome: Biomes.SINGULARITY
    },
    GALAXY: {
        name: 'Galaxy',
        chance: 5_000_000n,
        description: 'Une spirale galactique déploie autour de vous ses bras chargés de poussière et de lumière',
        biome: Biomes.SINGULARITY
    },
    GARGANTUA: {
        name: 'GARGANTUA',
        chance: 430_000_000n,
        description: 'Un abîme gravitationnel ouvre son anneau de feu et plie le ciel à sa démesure',
        biome: Biomes.SINGULARITY
    },
    EQUINOX: {
        name: '『Equinox』',
        chance: 2_500_000_000n,
        description: 'Le jour et la nuit s’équilibrent autour de vous dans une harmonie cosmique parfaite',
        biome: Biomes.SINGULARITY
    },
    SINGULARITYEVENTHORIZON: {
        name: 'SINGULARITY : EVENT HORIZON',
        chance: 900_000_000_000n,
        description: 'Au-delà de votre halo, la lumière abandonne toute promesse de retour',
        biome: Biomes.SINGULARITY
    },
    ORBITALCOLLAPSE: {
        name: 'ORBITAL : COLLAPSE',
        chance: 4_300_000_000n,
        description: 'Des anneaux d’astres s’effondrent vers le cœur lumineux de votre aura',
        biome: Biomes.SINGULARITY
    }
} as const
