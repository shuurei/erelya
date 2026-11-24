import { Biomes } from '../biomes'

export const dreamspaceAuras = {
    MEMORY: {
        name: 'Memory',
        chance: 100n,
        description: 'Des fragments de souvenirs oubliés flottent dans votre sillage, refusant de disparaître',
        biome: Biomes.DREAMSPACE
    },
    ALICE: {
        name: '《 Alice 》',
        chance: 3_500_000n,
        description: 'Des éclats de conte ouvrent sous vos pas un passage vers un merveilleux inquiétant',
        biome: Biomes.DREAMSPACE
    },
    LULLABY: {
        name: 'Lullaby',
        chance: 17_000_000n,
        description: 'Une berceuse lointaine apaise les ombres et enveloppe votre présence d’une douceur mélancolique',
        biome: Biomes.DREAMSPACE
    },
    DREAMMETRIC: {
        name: 'Dreammetric',
        chance: 520_000_000n,
        description: 'Des mesures impossibles tracent la géométrie de vos rêves et défient les distances du réel',
        biome: Biomes.DREAMSPACE
    },
    DREAMSCAPE: {
        name: 'dreamscape',
        chance: 850_000_000n,
        description: 'Des paysages impossibles naissent et s’effacent autour de vous au rythme d’un rêve éveillé',
        biome: Biomes.DREAMSPACE
    },
    DREAMONEIROS: {
        name: 'DREAM : ONEIROS',
        chance: 8_500_000_000n,
        description: 'Les rêves oubliés prennent la forme de constellations mouvantes',
        biome: Biomes.DREAMSPACE
    }
} as const
