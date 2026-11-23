import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('aura_biomes')
@Check('aura_biomes_multiplier_positive', '"multiplier" >= 1')
export class AuraBiome {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'integer' })
    multiplier: number;
}
