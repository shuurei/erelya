export const BiomeDefinitions = {
    NORMAL: {
        name: 'Normal',
        multiplier: 1,
        description: 'Une plaine paisible, sans bonus de biome'
    },
    WINDY: {
        name: 'Windy',
        multiplier: 3,
        description: 'Des vents vifs emportent les auras des cieux'
    },
    SNOWY: {
        name: 'Snowy',
        multiplier: 3,
        description: 'Un voile de neige nourrit les énergies glaciales'
    },
    RAINY: {
        name: 'Rainy',
        multiplier: 4,
        description: 'Les pluies réveillent les puissances océaniques'
    },
    SANDSTORM: {
        name: 'Sandstorm',
        multiplier: 4,
        description: 'Les dunes ensevelissent les traces des anciens royaumes'
    },
    HELL: {
        name: 'Hell',
        multiplier: 6,
        description: 'Les flammes infernales dévorent un horizon écarlate'
    },
    STARFALL: {
        name: 'Starfall',
        multiplier: 5,
        description: 'Une pluie d’étoiles traverse la nuit'
    },
    HEAVEN: {
        name: 'Heaven',
        multiplier: 5,
        description: 'Une lumière sacrée ouvre les portes du firmament'
    },
    LOSTFOREST: {
        name: 'Lost Forest',
        multiplier: 2,
        description: 'Les arbres anciens veillent sur une magie oubliée'
    },
    CORRUPTION: {
        name: 'Corruption',
        multiplier: 5,
        description: 'Une brume empoisonnée propage ses mutations'
    },
    NULL: {
        name: 'Null',
        multiplier: 1000,
        description: 'La couleur disparaît, ne laissant que les erreurs du monde'
    },
    GLITCHED: {
        name: 'Glitched',
        multiplier: 1000,
        description: 'La réalité se désynchronise en fragments instables'
    },
    DREAMSPACE: {
        name: 'Dreamspace',
        multiplier: 8,
        description: 'Les songes prennent forme dans un ciel irréel'
    },
    CYBERSPACE: {
        name: 'Cyberspace',
        multiplier: 8,
        description: 'Des réseaux lumineux redessinent les frontières du réel'
    },
    SINGULARITY: {
        name: 'Singularity',
        multiplier: 5,
        description: 'Un puits gravitationnel déforme la lumière des galaxies'
    },
    THERADIANTFOREST: {
        name: 'The Radiant Forest',
        multiplier: 10,
        description: 'Une forêt lumineuse fait éclore une vie transcendante'
    }
} as const

type BiomeNames = { readonly [Key in keyof typeof BiomeDefinitions]: (typeof BiomeDefinitions)[Key]['name'] }

export const Biomes = Object.fromEntries(
    Object.entries(BiomeDefinitions).map(([key, biome]) => [key, biome.name])
) as BiomeNames
