import { Biomes } from '../biomes'

export const windyAuras = {
    WIND: {
        name: 'Wind',
        chance: 900n,
        description: 'Un vent joueur soulève des spirales invisibles et porte vos pas vers l’horizon',
        biome: Biomes.WINDY
    },
    FLOW: {
        name: '✿ Flow ✿',
        chance: 87_000n,
        description: 'Pétales et courants de lumière suivent vos gestes dans une harmonie sans effort',
        biome: Biomes.WINDY
    },
    STORMAL: {
        name: 'Stormal',
        chance: 90_000n,
        description: 'Des bourrasques chargées d’éclairs annoncent l’orage qui sommeille dans votre aura',
        biome: Biomes.WINDY
    },
    HURRICANE: {
        name: 'Hurricane',
        chance: 13_500_000n,
        description: 'Un œil de calme vous entoure tandis que des vents furieux déchirent votre sillage',
        biome: Biomes.WINDY
    },
    AVIATOR: {
        name: '★ AVIATOR ★',
        chance: 24_000_000n,
        description: 'Des sillons de vent dessinent des ailes et vous promettent un ciel sans frontières',
        biome: Biomes.WINDY
    },
    MAELSTROM: {
        name: 'MAELSTROM',
        chance: 309_999_999n,
        description: 'Un gouffre de courants contraires entraîne l’air et la lumière dans une spirale sans fond',
        biome: Biomes.WINDY
    },
    TEMPESTCROWN: {
        name: 'TEMPEST : CROWN',
        chance: 135_000_000n,
        description: 'Une couronne d’éclairs flotte au centre d’un cyclone silencieux',
        biome: Biomes.WINDY
    },
    ZEPHYRFREEDOM: {
        name: 'ZEPHYR : FREEDOM',
        chance: 870_000n,
        description: 'Un souffle indomptable brise les entraves et disperse les nuages',
        biome: Biomes.WINDY
    }
} as const
