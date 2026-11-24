import { Biomes } from '../biomes'

export const theRadiantForestAuras = {
    LOTUSFALL: {
        name: 'LOTUSFALL',
        chance: 320_000_000n,
        description: 'Des lotus lumineux descendent lentement, offrant à votre aura la paix des jardins suspendus',
        biome: Biomes.THERADIANTFOREST
    },
    FLORAEVERGREEN: {
        name: 'Flora : Evergreen',
        chance: 370_073_730n,
        description: 'Une forêt impérissable déploie son souffle vert autour de vous, insensible au passage des saisons',
        biome: Biomes.THERADIANTFOREST
    },
    SOPHYRA: {
        name: 'Sophyra',
        chance: 570_000_000n,
        description: 'Une lumière posée déroule des arabesques savantes, comme la pensée d’un esprit ancien',
        biome: Biomes.THERADIANTFOREST
    },
    LUMINOSITY: {
        name: '[ Luminosity ]',
        chance: 1_200_000_000n,
        description: 'Une clarté immense émane de votre présence, assez vive pour rendre leur éclat aux étoiles',
        biome: Biomes.THERADIANTFOREST
    },
    BLOOMELYSIUM: {
        name: 'BLOOM : ELYSIUM',
        chance: 4_850_000_000n,
        description: 'Un jardin suspendu fait éclore des fleurs dont les pétales éclairent les âmes',
        biome: Biomes.THERADIANTFOREST
    },
    RADIANCEINFINITY: {
        name: 'RADIANCE : INFINITY',
        chance: 1_000_000_000_000_000_000n,
        description: 'Une lumière inépuisable nourrit les branches d’une forêt plus vaste que le temps',
        biome: Biomes.THERADIANTFOREST
    }
} as const
