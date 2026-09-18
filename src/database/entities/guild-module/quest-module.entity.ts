import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Guild } from '../guild.entity';

export const defaultQuestModule = {
    isEnabled: true,
    isMessageQuestEnabled: true,
    isVoiceQuestEnabeld: true,
} as const;

@Entity()
export class QuestModule {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'boolean', default: false })
    isEnabled: boolean;

    // Global
    @Column({ type: 'boolean', default: true })
    isMessageQuestEnabled: boolean;
    @Column({ type: 'boolean', default: true })
    isVoiceQuestEnabeld: boolean;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;
}