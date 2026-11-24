import { Auras } from './auras'

export const AURA_GLOVE_INGREDIENTS = {
    copper: {
        [Auras.COMMON]: 25,
        [Auras.UNCOMMON]: 15,
        [Auras.COPPER]: 1
    },
    crystal: {
        [Auras.CRYSTALLIZED]: 15,
        [Auras.QUARTZ]: 5,
        [Auras.PRECIOUS]: 8
    },
    storm: {
        [Auras.WIND]: 15,
        [Auras.MAGNETIC]: 8,
        [Auras.STORMAL]: 3
    },
    celestial: {
        [Auras.DIVINUS]: 30,
        [Auras.SOLAR]: 5,
        [Auras.LUNAR]: 5,
        [Auras.CELESTIAL]: 2
    },   
    void: {
        [Auras.FORBIDDEN]: 30,
        [Auras.UNDEFINED]: 5,
        [Auras.ARCANE]: 4,
        [Auras.NIHILITY]: 2
    },
    infernal: {
        [Auras.DIABOLI]: 75,
        [Auras.UNDEAD]: 30,
        [Auras.UNDEADDEVIL]: 5,
        [Auras.HADES]: 2
    },
    astral: {
        [Auras.STARLIGHT]: 45,
        [Auras.COMET]: 15,
        [Auras.ASTRAL]: 8,
        [Auras.GALAXY]: 3
    },
    chromatic: {
        [Auras.EXOTIC]: 45,
        [Auras.VIRTUAL]: 15,
        [Auras.CHROMATIC]: 5,
        [Auras.MATRIX]: 2
    },
    sovereign: {
        [Auras.ARCANE]: 45,
        [Auras.ETHEREAL]: 8,
        [Auras.ARCHANGEL]: 3,
        [Auras.SOVEREIGN]: 2
    },
    singularity: {
        [Auras.GRAVITATIONAL]: 75,
        [Auras.GARGANTUA]: 8,
        [Auras.LUMINOSITY]: 4,
        [Auras.EQUINOX]: 2
    }
} as const;
