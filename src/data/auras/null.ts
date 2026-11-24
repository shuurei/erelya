import { Biomes } from '../biomes'

export const nullAuras = {
    UNDEFINED: {
        name: 'Undefined',
        chance: 1_111_000n,
        description: 'Vos contours hésitent entre plusieurs formes, comme une réponse que l’univers ne connaît pas',
        biome: Biomes.NULL
    },
    SHIFTLOCK: {
        name: 'Shift lock',
        chance: 3_325_000n,
        description: 'L’espace se verrouille sur votre regard et chaque mouvement semble suivre un axe parfait',
        biome: Biomes.NULL
    },
    NIHILITY: {
        name: '[ Nihility ]',
        chance: 9_000_000n,
        description: 'Une absence vertigineuse dévore les couleurs et laisse le monde sans réponse',
        biome: Biomes.NULL
    },
    NULLABSOLUTE: {
        name: 'NULL : ABSOLUTE',
        chance: 1_000_000_000_000n,
        description: 'Même l’absence s’efface devant le silence absolu de votre présence',
        biome: Biomes.NULL
    },
    VOIDEPITAPH: {
        name: 'VOID : EPITAPH',
        chance: 77_777_777n,
        description: 'Des inscriptions pâles racontent la fin d’étoiles qui ne sont jamais nées',
        biome: Biomes.NULL
    }
} as const
