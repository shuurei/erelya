import { ROLLABLE_AURAS } from '@/data/auras'
import { BiomeDefinitions } from '@/data/biomes'
import { auraHour, AURA_HOUR_MS } from '@/utils/aura-hour'

const biomes = Object.values(BiomeDefinitions);

export class AuraBiomeService {
    static current(hour = auraHour()) {
        const biome = biomes[(hour.startedAt / AURA_HOUR_MS) % biomes.length];
        const auras = ROLLABLE_AURAS.filter(aura => aura.biome === biome.name);

        return { ...biome, auras, changesAt: hour.changesAt };
    }
}
