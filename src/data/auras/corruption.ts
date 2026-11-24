import { Biomes } from '../biomes'

export const corruptionAuras = {
    HAZARD: {
        name: 'HAZARD',
        chance: 7_000n,
        description: 'Une lueur toxique pulse derrière des signes d’avertissement que personne ne devrait ignorer',
        biome: Biomes.CORRUPTION
    },
    CORROSIVE: {
        name: 'Corrosive',
        chance: 12_000n,
        description: 'Une brume acide dévore les contours de votre ombre et laisse une lueur verdâtre',
        biome: Biomes.CORRUPTION
    },
    HAZARDRAYS: {
        name: 'HAZARD : RAYS',
        chance: 70_000n,
        description: 'Des rayons fluorescents découpent la brume toxique et gravent leurs avertissements dans l’air',
        biome: Biomes.CORRUPTION
    },
    PARASITE: {
        name: 'PARASITE',
        chance: 3_000_000n,
        description: 'Une présence étrangère s’accroche à votre énergie et grandit au rythme de vos pulsations',
        biome: Biomes.CORRUPTION
    },
    IMPEACHED: {
        name: 'IMPEACHED',
        chance: 200_000_000n,
        description: 'Une couronne déchue brûle dans votre ombre, témoin d’une autorité que le monde a rejetée',
        biome: Biomes.CORRUPTION
    },
    CORRUPTIONBLACKTHRONE: {
        name: 'CORRUPTION : BLACKTHRONE',
        chance: 3_000_000_000n,
        description: 'Un trône d’épines toxiques grandit dans la brume de votre présence',
        biome: Biomes.CORRUPTION
    }
} as const
