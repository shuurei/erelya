import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity()
export class User {
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @Column({ type: 'timestamp', nullable: true })
    tagAssignedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;
}