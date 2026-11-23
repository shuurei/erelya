import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Aura } from './aura.entity'

@Entity('member_auras')
@Check('member_auras_count_positive', '"count" >= 0')
export class MemberAura {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @PrimaryColumn({ type: 'integer' })
    auraId: number;

    @ManyToOne(() => Aura, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'auraId' })
    aura: Aura;

    @Column({ type: 'integer', default: 1 })
    count: number;

    @CreateDateColumn({ type: 'timestamptz' })
    obtainedAt: Date;
}
