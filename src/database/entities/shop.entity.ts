import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { Guild } from './guild.entity'

@Entity()
export class Shop {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @PrimaryColumn({ type: 'varchar' })
    name: string;

    @Column({ type: 'boolean', default: true })
    isOpen: boolean;

    @Column({ type: 'boolean', default: false })
    useTagDiscount: boolean;

    @Column({ type: 'int', nullable: true })
    color?: number | null;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @Column({ type: 'varchar', length: 32, nullable: true })
    emoji?: string | null;

    @Column({ type: 'text', nullable: true })
    bannerUrl?: string | null;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt?: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    get isCurrentlyOpen(): boolean {
        if (!this.expiresAt || !this.isOpen) return this.isOpen;

        const now = new Date();
        return now < this.expiresAt;
    }
}