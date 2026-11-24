import { Biomes } from '../biomes'

export const hellAuras = {
    DIABOLI: {
        name: 'Diaboli',
        chance: 1_004n,
        description: 'Des flammes sombres lèchent votre ombre et répondent aux murmures des profondeurs',
        biome: Biomes.HELL
    },
    UNDEAD: {
        name: 'Undead',
        chance: 12_000n,
        description: 'Une volonté tenace anime les ombres à vos pieds, refusant le repos éternel',
        biome: Biomes.HELL
    },
    DIABOLIVOID: {
        name: 'DIABOLI ▽ VOID',
        chance: 100_400n,
        description: 'Un triangle d’ombre s’ouvre derrière vous et absorbe les dernières braises infernales',
        biome: Biomes.HELL
    },
    UNDEADDEVIL: {
        name: 'UNDEAD : DEVIL',
        chance: 666_666n,
        description: 'Une volonté revenue de la tombe se couronne de flammes et de cornes d’ombre',
        biome: Biomes.HELL
    },
    HADES: {
        name: 'Hades',
        chance: 6_666_666n,
        description: 'Des braises souterraines illuminent un royaume d’ombres qui reconnaît votre passage',
        biome: Biomes.HELL
    },
    BLOODLUST: {
        name: '+ B L O O D L U S T +',
        chance: 300_000_000n,
        description: 'Une pulsation écarlate nourrit une soif de combat que chaque battement rend plus intense',
        biome: Biomes.HELL
    },
    EMBERCOVENANT: {
        name: 'EMBER : COVENANT',
        chance: 66_000n,
        description: 'Des braises scellent un pacte dont chaque étincelle murmure votre nom',
        biome: Biomes.HELL
    },
    INFERNALREGALIA: {
        name: 'INFERNAL : REGALIA',
        chance: 666_000_000n,
        description: 'Une couronne de flammes noires commande aux ombres des profondeurs',
        biome: Biomes.HELL
    },
    HELLFIREABSOLUTION: {
        name: 'HELLFIRE : ABSOLUTION',
        chance: 9_000_000_000n,
        description: 'Un incendie sacrilège consume les chaînes de votre destin',
        biome: Biomes.HELL
    }
} as const
