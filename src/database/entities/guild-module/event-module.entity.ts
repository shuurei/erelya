import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Guild } from '../guild.entity'

export const defaultEventModule = {
    isEnabled: false,

    // Global
    randomEventCooldown: 180,
    randomEventChance: 0.05,

    // Guild Coins
    isGuildCoinEventEnabled: true,
    guildCoinsChance: 0.4,
    guildCoinsMinGain: 1_000,
    guildCoinsMaxGain: 2_000,

    // Activity Xp
    isActivityXpEventEnabled: true,
    activityXpChance: 0.6,
    activityXpMinGain: 500,
    activityXpMaxGain: 800,
} as const;

@Entity()
export class EventModule {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'boolean', default: false })
    isEnabled: boolean;

    // Global
    @Column({ type: 'int', default: defaultEventModule.randomEventCooldown })
    randomEventCooldown: number;
    @Column({ type: 'numeric', default: defaultEventModule.randomEventChance })
    randomEventChance: number;

    // Guild Coins
    @Column({ type: 'boolean', default: defaultEventModule.isGuildCoinEventEnabled })
    isGuildCoinEventEnabled: boolean;
    @Column({ type: 'numeric', default: defaultEventModule.guildCoinsChance })
    guildCoinsChance: number;
    @Column({ type: 'int', default: defaultEventModule.guildCoinsMinGain })
    guildCoinsMinGain: number;
    @Column({ type: 'int', default: defaultEventModule.guildCoinsMaxGain })
    guildCoinsMaxGain: number;

    // Activity Xp
    @Column({ type: 'boolean', default: defaultEventModule.isActivityXpEventEnabled })
    isActivityXpEventEnabled: boolean;
    @Column({ type: 'numeric', default: defaultEventModule.activityXpChance })
    activityXpChance: number;
    @Column({ type: 'int', default: defaultEventModule.activityXpMinGain })
    activityXpMinGain: number;
    @Column({ type: 'int', default: defaultEventModule.activityXpMaxGain })
    activityXpMaxGain: number;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;
}