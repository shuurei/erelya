import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm'
import { Guild } from './guild.entity'

@Entity()
export class GuildLevelReward {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @PrimaryColumn({ type: 'varchar' })
    atLevel: number;

    @Column({ type: 'int', nullable: true })
    coinsReward?: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    roleId?: string;

    @Column({ type: 'boolean', nullable: true })
    isStackable?: boolean;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;
}