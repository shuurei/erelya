import { Check, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

@Entity('member_auras')
@Check('member_auras_count_positive', '"count" >= 0')
export class MemberAura {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @PrimaryColumn({ type: 'varchar' })
    auraKey: string;

    @Column({ type: 'integer', default: 1 })
    count: number;

    @Column({ type: 'integer', nullable: true })
    firstLuckPercent: number | null;

    @CreateDateColumn({ type: 'timestamptz' })
    obtainedAt: Date;
}
