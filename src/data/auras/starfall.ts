import { Biomes } from '../biomes'

export const starfallAuras = {
    STARLIGHT: {
        name: 'STARLIGHT',
        chance: 50_000n,
        description: 'De fines étoiles s’allument dans votre sillage et refusent de céder à la nuit',
        biome: Biomes.STARFALL
    },
    STARRIDER: {
        name: 'Star Rider',
        chance: 50_000n,
        description: 'Une traînée stellaire dessine votre route, comme si vous chevauchiez la voûte céleste',
        biome: Biomes.STARFALL
    },
    ASTRAL: {
        name: 'Astral',
        chance: 1_336_000n,
        description: 'Votre esprit semble marcher parmi les constellations tandis que votre ombre demeure ici',
        biome: Biomes.STARFALL
    },
    STARGAZER: {
        name: '☆ Stargazer ☆',
        chance: 9_200_000n,
        description: 'Des cartes du ciel se dessinent autour de vous, guidées par votre regard tourné vers l’infini',
        biome: Biomes.STARFALL
    },
    STARSCOURGE: {
        name: 'STARSCOURGE',
        chance: 10_000_000n,
        description: 'Une pluie d’étoiles fracassées annonce une puissance capable de bouleverser le firmament',
        biome: Biomes.STARFALL
    },
    SIRIUS: {
        name: 'Sirius',
        chance: 14_000_000n,
        description: 'Une étoile d’un blanc intense domine votre aura et guide les regards égarés',
        biome: Biomes.STARFALL
    },
    STARSCOURGERADIANT: {
        name: 'STARSCOURGE : RADIANT',
        chance: 100_000_000n,
        description: 'Les étoiles brisées renaissent dans une déferlante de lumière qui consume la nuit',
        biome: Biomes.STARFALL
    },
    ASTRALZODIAC: {
        name: '🔆 Astral : Zodiac ☾',
        chance: 267_200_000n,
        description: 'Les signes du zodiaque tournent autour de vous et tissent leurs destins dans la lumière astrale',
        biome: Biomes.STARFALL
    },
    STELLARREQUIEM: {
        name: 'STELLAR : REQUIEM',
        chance: 120_000_000n,
        description: 'Des étoiles mourantes chantent une dernière mélodie dans votre sillage',
        biome: Biomes.STARFALL
    },
    COSMICAPOTHEOSIS: {
        name: 'COSMIC : APOTHEOSIS',
        chance: 1_000_000_000_000_000n,
        description: 'Un firmament nouveau s’élève autour de vous et vous reconnaît pour origine',
        biome: Biomes.STARFALL
    }
} as const
