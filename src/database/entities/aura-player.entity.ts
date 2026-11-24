import { Check, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('aura_player')
@Check('aura_players_rolls_used', '"rollsUsed" BETWEEN 0 AND 10')
@Check('aura_players_luck_positive', '"luck" >= 1')
@Check('aura_players_luck_rolls_positive', '"luckRollsRemaining" >= 0')
@Check('aura_players_godly_purchases', '"godlyPurchases" BETWEEN 0 AND 5')
@Check('aura_players_monthly_purchases', '"monthlyPurchases" BETWEEN 0 AND 3')
@Check('aura_players_glove_level', '"gloveLevel" BETWEEN 0 AND 10')
export class AuraPlayer {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @Column({ type: 'timestamptz', nullable: true })
    rollHour: Date | null;

    @Column({ type: 'integer', default: 0 })
    rollsUsed: number;

    @Column({ type: 'integer', default: 1 })
    luck: number;

    @Column({ type: 'integer', default: 0 })
    luckRollsRemaining: number;

    @Column({ type: 'timestamptz', nullable: true })
    potionWeekStartedAt: Date | null;

    @Column({ type: 'integer', default: 0 })
    godlyPurchases: number;

    @Column({ type: 'timestamptz', nullable: true })
    potionMonthStartedAt: Date | null;

    @Column({ type: 'integer', default: 0 })
    monthlyPurchases: number;

    @Column({ type: 'integer', default: 0 })
    gloveLevel: number;

    @Column({ type: 'varchar', nullable: true })
    equippedAuraKey: string | null;
}
