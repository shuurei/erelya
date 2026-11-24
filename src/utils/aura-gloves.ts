import { AURA_GLOVE_INGREDIENTS } from '@/data/aura-gloves'

export const AURA_GLOVES = [
    {
        key: 'copper',
        name: 'Gant cuivré',
        luckBonusPercent: 100,
        recipe: AURA_GLOVE_INGREDIENTS.copper
    },
    {
        key: 'crystal',
        name: 'Gant cristallin',
        luckBonusPercent: 400,
        recipe: AURA_GLOVE_INGREDIENTS.crystal
    },
    {
        key: 'storm',
        name: 'Gant des tempêtes',
        luckBonusPercent: 900,
        recipe: AURA_GLOVE_INGREDIENTS.storm
    },
    {
        key: 'celestial',
        name: 'Gant céleste',
        luckBonusPercent: 2400,
        recipe: AURA_GLOVE_INGREDIENTS.celestial
    },
    {
        key: 'void',
        name: 'Gant du néant',
        luckBonusPercent: 9900,
        recipe: AURA_GLOVE_INGREDIENTS.void
    },
    {
        key: 'infernal',
        name: 'Gant infernal',
        luckBonusPercent: 24900,
        recipe: AURA_GLOVE_INGREDIENTS.infernal
    },
    {
        key: 'astral',
        name: 'Gant astral',
        luckBonusPercent: 49900,
        recipe: AURA_GLOVE_INGREDIENTS.astral
    },
    {
        key: 'chromatic',
        name: 'Gant chromatique',
        luckBonusPercent: 99900,
        recipe: AURA_GLOVE_INGREDIENTS.chromatic
    },
    {
        key: 'sovereign',
        name: 'Gant souverain',
        luckBonusPercent: 249900,
        recipe: AURA_GLOVE_INGREDIENTS.sovereign
    },
    {
        key: 'singularity',
        name: 'Gant de singularité',
        luckBonusPercent: 999900,
        recipe: AURA_GLOVE_INGREDIENTS.singularity
    }
] as const;

export const gloveLuckBonusPercent = (level: number) => {
    return AURA_GLOVES[level - 1]?.luckBonusPercent ?? 0;
}
