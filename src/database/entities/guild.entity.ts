import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity()
export class Guild {
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @Column({ type: 'varchar', nullable: true })
    welcomeChannelId: string | null;

    @Column({ type: 'varchar', nullable: true })
    supportRoleId: string | null;

    @Column({ type: 'varchar', nullable: true })
    messageDeletedAuditChannelId: string | null;

    @Column({ type: 'varchar', nullable: true })
    messageEditedAuditChannelId: string | null;

    @Column({ type: 'timestamp', nullable: true })
    lastEventAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    nextPortalGenerationAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;
}