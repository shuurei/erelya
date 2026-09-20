import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Guild } from '../guild.entity'

export const defaultLevelModule = {
    isEnabled: false,

    // Boost Factor
    guildBoosterFactor: 0.2,
    tagSupporterFactor: 0.2,

    // Message
    isXpFromMessageEnabled: true,
    messageChance: 0.3,

    // Call
    isXpFromCallEnabled: true,
    callPrivatePenalty: 0.25,
    callMutedPenalty: 0.25,
    callDeafPenalty: 0.35,
    callCameraBonus: 0.15,
    callStreamBonus: 0.15,
    callGainIntervalMinutes: 15,

    // Growth
    maxLevel: 100
} as const;

@Entity()
export class LevelModule {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'boolean', default: false })
    isEnabled: boolean;

    // Boost Factor
    @Column({ type: 'real', default: defaultLevelModule.guildBoosterFactor })
    guildBoosterFactor: number;
    @Column({ type: 'real', default: defaultLevelModule.tagSupporterFactor })
    tagSupporterFactor: number;

    // Mesage
    @Column({ type: 'boolean', default: defaultLevelModule.isXpFromMessageEnabled })
    isXpFromMessageEnabled: boolean;
    @Column({ type: 'real', default: defaultLevelModule.messageChance })
    messageChance: number;

    // Call
    @Column({ type: 'boolean', default: defaultLevelModule.isXpFromCallEnabled })
    isXpFromCallEnabled: boolean;
    @Column({ type: 'real', default: defaultLevelModule.callGainIntervalMinutes })
    callGainIntervalMinutes: number;
    @Column({ type: 'real', default: defaultLevelModule.callPrivatePenalty })
    callPrivatePenalty: number;
    @Column({ type: 'real', default: defaultLevelModule.callMutedPenalty })
    callMutedPenalty: number;
    @Column({ type: 'real', default: defaultLevelModule.callDeafPenalty })
    callDeafPenalty: number;
    @Column({ type: 'real', default: defaultLevelModule.callCameraBonus })
    callCameraBonus: number;
    @Column({ type: 'real', default: defaultLevelModule.callStreamBonus })
    callStreamBonus: number;

    // Growth
    @Column({ type: 'int', default: defaultLevelModule.maxLevel })
    maxLevel: number;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;
}