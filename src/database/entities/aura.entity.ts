import { Check, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { AuraBiome } from './aura-biome.entity'

@Entity('auras')
@Index('IDX_auras_biome', ['biomeId'])
@Check('auras_chance_positive', '"chance" >= 1')
export class Aura {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'numeric', precision: 1000, scale: 0 })
    chance: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'integer', nullable: true })
    biomeId: number | null;

    @ManyToOne(() => AuraBiome, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'biomeId' })
    biome: AuraBiome | null;
}
