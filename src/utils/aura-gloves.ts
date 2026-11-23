export const AURA_GLOVES = [
    {
        key: 'copper',
        name: 'Gant cuivré',
        luck: 2,
        recipe: { Common: 10, Uncommon: 5, COPPER: 1 }
    },
    {
        key: 'crystal',
        name: 'Gant cristallin',
        luck: 5,
        recipe:
        { Crystallized: 10, Quartz: 3, Precious: 5 }
    },
    {
        key: 'storm',
        name: 'Gant des tempêtes',
        luck: 10,
        recipe: { Wind: 10, Magnetic: 5, Stormal: 2 }
    },
    {
        key: 'celestial',
        name: 'Gant céleste',
        luck: 25,
        recipe: { Divinus: 20, Solar: 3, Lunar: 3, Celestial: 1 }
    },
    {
        key: 'void',
        name: 'Gant du néant',
        luck: 100,
        recipe: { Forbidden: 20, Undefined: 3, Arcane: 2, '[ Nihility ]': 1 }
    },
    {
        key: 'infernal',
        name: 'Gant infernal',
        luck: 250,
        recipe: { Diaboli: 50, Undead: 20, 'UNDEAD : DEVIL': 3, Hades: 1 }
    },
    {
        key: 'astral',
        name: 'Gant astral',
        luck: 500,
        recipe: { STARLIGHT: 30, COMET: 10, Astral: 5, Galaxy: 2 }
    },
    {
        key: 'chromatic',
        name: 'Gant chromatique',
        luck: 1000,
        recipe: { Exotic: 30, Virtual: 10, CHROMATIC: 3, Matrix: 1 }
    },
    {
        key: 'sovereign',
        name: 'Gant souverain',
        luck: 2500,
        recipe: { Arcane: 30, Ethereal: 5, ARCHANGEL: 2, SOVEREIGN: 1 }
    },
    {
        key: 'singularity',
        name: 'Gant de singularité',
        luck: 10000,
        recipe: { Gravitational: 50, GARGANTUA: 5, '[ Luminosity ]': 2, '『Equinox』': 1 }
    }
] as const;

export const gloveLuck = (level: number) => {
    return AURA_GLOVES[level - 1]?.luck ?? 1;
}
