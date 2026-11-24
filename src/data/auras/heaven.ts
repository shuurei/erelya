import { Biomes } from '../biomes'

export const heavenAuras = {
    DIVINUS: {
        name: 'Divinus',
        chance: 32n,
        description: 'Un halo sacré se dessine autour de vous, doux comme une bénédiction murmurée',
        biome: Biomes.HEAVEN
    },
    DIVINUSANGEL: {
        name: 'Divinus : Angel',
        chance: 120_000n,
        description: 'Des ailes de lumière déploient autour de vous la douceur implacable d’un gardien céleste',
        biome: Biomes.HEAVEN
    },
    CELESTIAL: {
        name: 'Celestial',
        chance: 350_000n,
        description: 'Une voûte d’étoiles vous accompagne, vaste refuge contre les ténèbres terrestres',
        biome: Biomes.HEAVEN
    },
    HOPE: {
        name: 'Hope',
        chance: 488_725n,
        description: 'Une flamme claire demeure près de votre cœur, même lorsque toutes les autres s’éteignent',
        biome: Biomes.HEAVEN
    },
    FAITH: {
        name: 'Faith',
        chance: 1_450_000n,
        description: 'Une lumière patiente vous accompagne, soutenue par une conviction que rien ne peut ébranler',
        biome: Biomes.HEAVEN
    },
    ZEUS: {
        name: 'Zeus',
        chance: 4_500_000n,
        description: 'Un tonnerre souverain gronde dans votre aura et fend les nuages d’éclairs blancs',
        biome: Biomes.HEAVEN
    },
    CELESTIALDIVINE: {
        name: '« CELESTIAL ✰ DIVINE »',
        chance: 7_000_000n,
        description: 'Une majesté céleste déploie ses halos et transforme chaque étoile en sceau sacré',
        biome: Biomes.HEAVEN
    },
    DIVINUSGUARDIAN: {
        name: 'Divinus : Guardian',
        chance: 7_777_777n,
        description: 'Un cercle protecteur veille autour de vous, ferme comme un serment prononcé dans la lumière',
        biome: Biomes.HEAVEN
    },
    ICARUS: {
        name: 'Icarus',
        chance: 15_660_000n,
        description: 'Des plumes dorées s’élèvent vers une lumière brûlante, partagées entre audace et vertige',
        biome: Biomes.HEAVEN
    },
    ARCHANGEL: {
        name: 'ARCHANGEL',
        chance: 350_000_000n,
        description: 'Des ailes majestueuses embrassent le ciel et dressent votre lumière face aux ténèbres',
        biome: Biomes.HEAVEN
    },
    SERAPHJUDGEMENT: {
        name: 'SERAPH : JUDGEMENT',
        chance: 777_000_000n,
        description: 'Des ailes de feu blanc prononcent un verdict que les ténèbres redoutent',
        biome: Biomes.HEAVEN
    },
    DIVINITYASCENSION: {
        name: 'DIVINITY : ASCENSION',
        chance: 7_777_777_777_777n,
        description: 'Un escalier de lumière se déploie sous vos pas vers un ciel sans limites',
        biome: Biomes.HEAVEN
    }
} as const
