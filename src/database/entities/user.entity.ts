import { UserDatabaseFlagsBitField } from '@/utils/user-flags';
import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity()
export class User {
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @Column({ type: 'int', default: 0 })
    flags: number;

    @Column({ type: 'timestamp', nullable: true })
    tagAssignedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    get flagsBitField() {
        return new UserDatabaseFlagsBitField(this.flags);
    }
}