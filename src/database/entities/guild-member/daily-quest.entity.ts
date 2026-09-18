import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { GuildMember } from '../guild-member.entity'

export enum GuildMemberDailyQuestType {
    CALL = 'call',
    STREAM = 'stream'
}

@Entity()
export class GuildMemberDailyQuest  {
    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'enum', enum: GuildMemberDailyQuestType })
    type: GuildMemberDailyQuestType;

    @Column({ type: 'integer'})
    target: number;

    @Column({ type: 'integer', default: 0 })
    progress: number;

    @Column({ type: 'timestamp' })
    startAt: Date;

    @Column({ type: 'boolean', default: false })
    isClaimed: boolean;

    @ManyToOne(() => GuildMember, { onDelete: 'CASCADE' })
    @JoinColumn([
        { name: 'userId', referencedColumnName: 'userId' },
        { name: 'guildId', referencedColumnName: 'guildId' }
    ])
    guildMember: GuildMember;

    get isCompleted() {
        return this.progress >= this.target;
    }
}