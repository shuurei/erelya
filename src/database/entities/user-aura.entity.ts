import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

@Entity('user_auras')
export class UserAura {
    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @PrimaryColumn({ type: 'varchar' })
    auraKey: string;

    @CreateDateColumn({ type: 'timestamptz', nullable: true })
    obtainedAt: Date | null;
}
