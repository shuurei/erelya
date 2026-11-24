import type { SpecialAura } from './types'

export const SpecialAuras = {
    DEVELOPER: {
        name: '[DEVELOPER]',
        chance: null,
        biome: null,
        description: 'Une aura réservée aux personnes qui développent Erelya'
    },
    FREND: {
        name: '[FREND]',
        chance: null,
        biome: null,
        description: 'Un signe de reconnaissance offert aux amis d’Erelya'
    },
    RESCUE: {
        name: '[RESCUE]',
        chance: null,
        biome: null,
        description: 'Une distinction pour les personnes venues à la rescousse'
    }
} as const satisfies Record<string, SpecialAura>
