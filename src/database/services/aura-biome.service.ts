import { EntityManager } from 'typeorm'
import { db } from '../db'
import { auraHour, AURA_HOUR_MS } from '@/utils/aura-hour'
import { Aura } from '../entities/aura.entity'
import { AuraBiome } from '../entities/aura-biome.entity'

export class AuraBiomeService {
    static async current(manager: EntityManager = db.manager): Promise<AuraBiome & { auras: Aura[]; changesAt: number }> {
        const hour = auraHour();

        const biomes = await manager.getRepository(AuraBiome).find({ order: { id: 'ASC' } });
        const biome = biomes[(hour.startedAt / AURA_HOUR_MS) % biomes.length];
        const auras = await manager.getRepository(Aura).find({ where: { biomeId: biome.id }, order: { id: 'ASC' } });
        
        return { ...biome, auras, changesAt: hour.changesAt };
    }
}
