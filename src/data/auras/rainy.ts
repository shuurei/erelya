import { Biomes } from '../biomes'

export const rainyAuras = {
    AQUATIC: {
        name: 'Aquatic',
        chance: 40_000n,
        description: 'Un courant limpide serpente autour de vous, peuplé de reflets venus des profondeurs',
        biome: Biomes.RAINY
    },
    NAUTILUS: {
        name: 'Nautilus',
        chance: 70_000n,
        description: 'Une spirale nacrée tourne autour de vous au rythme lent des marées anciennes',
        biome: Biomes.RAINY
    },
    POSEIDON: {
        name: 'Poseidon',
        chance: 4_000_000n,
        description: 'Des vagues royales se courbent à votre passage et portent l’autorité des océans',
        biome: Biomes.RAINY
    },
    SAILOR: {
        name: 'Sailor',
        chance: 12_000_000n,
        description: 'Le sel et le vent accompagnent votre aura, toujours attirée par un rivage lointain',
        biome: Biomes.RAINY
    },
    SAILORFLYINGDUTCHMAN: {
        name: 'Sailor : Flying Dutchman',
        chance: 80_000_000n,
        description: 'Des voiles spectrales émergent de la brume, condamnées à chercher un port introuvable',
        biome: Biomes.RAINY
    },
    MANTA: {
        name: 'Manta',
        chance: 300_000_000n,
        description: 'Une raie de lumière glisse autour de vous, paisible gardienne des eaux estivales',
        biome: Biomes.RAINY
    },
    ABYSSALHUNTER: {
        name: 'Abyssal Hunter',
        chance: 400_000_000n,
        description: 'Une silhouette prédatrice traverse les profondeurs de votre aura, guidée par une lueur abyssale',
        biome: Biomes.RAINY
    },
    ABYSSTHALASSA: {
        name: 'ABYSS : THALASSA',
        chance: 4_000_000_000n,
        description: 'Une mer sans rivage respire dans l’obscurité de votre halo',
        biome: Biomes.RAINY
    },
    TIDALLEVIATHAN: {
        name: 'TIDAL : LEVIATHAN',
        chance: 1_730_400_000n,
        description: 'Une ombre colossale soulève les marées qui gravitent autour de vous',
        biome: Biomes.RAINY
    }
} as const
