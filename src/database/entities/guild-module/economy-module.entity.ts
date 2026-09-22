import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Guild } from '../guild.entity'

export const defaultEconomyModule = {
    isEnabled: false,

    // Boost Factor
    guildBoosterFactor: 0.2,
    tagSupporterFactor: 0.2,

    // Message
    isGuildCoinsFromMessageEnabled: true,
    messageChance: 0.3,
    messageMinGain: 8,
    messageMaxGain: 24,

    // Call
    isGuildCoinsFromCallEnabled: true,
    callPrivatePenalty: 0.25,
    callMutedPenalty: 0.25,
    callDeafPenalty: 0.35,
    callCameraBonus: 0.15,
    callStreamBonus: 0.15,
    callGainIntervalMinutes: 15,
    callMinGain: 24,
    callMaxGain: 40,

    // Work
    isWorkEnabled: true,
    workCooldown: 60,
    workMinGain: 200,
    workMaxGain: 500,

    // Portal
    isPortalEnabled: true,

    // Shop
    isShopEnabled: false,

    // Gambling
    isGamblingEnabled: false,

    // Discount
    supporterPriceDiscount: 0.3,
} as const;

@Entity()
export class EconomyModule {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'boolean', default: false })
    isEnabled: boolean;

    // Boost Factor
    @Column({ type: 'real', default: defaultEconomyModule.guildBoosterFactor })
    guildBoosterFactor: number;
    @Column({ type: 'real', default: defaultEconomyModule.tagSupporterFactor })
    tagSupporterFactor: number;

    // Message
    @Column({ type: 'boolean', default: defaultEconomyModule.isGuildCoinsFromMessageEnabled })
    isGuildCoinsFromMessageEnabled: boolean;
    @Column({ type: 'real', default: defaultEconomyModule.messageChance })
    messageChance: number;
    @Column({ type: 'int', default: defaultEconomyModule.messageMinGain })
    messageMinGain: number;
    @Column({ type: 'int', default: defaultEconomyModule.messageMaxGain })
    messageMaxGain: number;

    // Call
    @Column({ type: 'boolean', default: defaultEconomyModule.isGuildCoinsFromCallEnabled })
    isGuildCoinsFromCallEnabled: boolean;
    @Column({ type: 'real', default: defaultEconomyModule.callPrivatePenalty })
    callPrivatePenalty: number;
    @Column({ type: 'real', default: defaultEconomyModule.callMutedPenalty })
    callMutedPenalty: number;
    @Column({ type: 'real', default: defaultEconomyModule.callDeafPenalty })
    callDeafPenalty: number;
    @Column({ type: 'real', default: defaultEconomyModule.callCameraBonus })
    callCameraBonus: number;
    @Column({ type: 'real', default: defaultEconomyModule.callStreamBonus })
    callStreamBonus: number;
    @Column({ type: 'int', default: defaultEconomyModule.callGainIntervalMinutes })
    callGainIntervalMinutes: number;
    @Column({ type: 'int', default: defaultEconomyModule.callMinGain })
    callMinGain: number;
    @Column({ type: 'int', default: defaultEconomyModule.callMaxGain })
    callMaxGain: number;

    // Work
    @Column({ type: 'boolean', default: defaultEconomyModule.isWorkEnabled })
    isWorkEnabled: boolean;
    @Column({ type: 'int', default: defaultEconomyModule.workCooldown })
    workCooldown: number;
    @Column({ type: 'int', default: defaultEconomyModule.workMinGain })
    workMinGain: number;
    @Column({ type: 'int', default: defaultEconomyModule.workMaxGain })
    workMaxGain: number;

    // Portal
    @Column({ type: 'boolean', default: defaultEconomyModule.isPortalEnabled })
    isPortalEnabled: boolean;

    // Shop
    @Column({ type: 'boolean', default: defaultEconomyModule.isShopEnabled })
    isShopEnabled: boolean;

    // Gambling
    @Column({ type: 'boolean', default: defaultEconomyModule.isGamblingEnabled })
    isGamblingEnabled: boolean;

    // Discount
    @Column({ type: 'real', default: defaultEconomyModule.supporterPriceDiscount })
    supporterPriceDiscount: number;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;
}