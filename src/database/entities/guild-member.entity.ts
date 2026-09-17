import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm'

import { User } from './user.entity'
import { Guild } from './guild.entity'

import { xpToLevel } from '@/utils'

@Entity()
export class GuildMember {
    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @PrimaryColumn({ type: 'varchar' })
    guildId: string;
    
    @Column({ type: 'integer', default: 0 })
    xp: number;

    @Column({ type: 'integer', default: 0 })
    coins: number;

    @Column({ type: 'int', default: 0 })
    messageCount: number;

    @Column({ type: 'int', default: 0 })
    callPrivateMinutes: number;

    @Column({ type: 'int', default: 0 })
    callPublicMinutes: number;

    @Column({ type: 'int', default: 0 })
    callActiveMinutes: number;

    @Column({ type: 'int', default: 0 })
    callDeafMinutes: number;

    @Column({ type: 'int', default: 0 })
    callMutedMinutes: number;

    @Column({ type: 'int', default: 0 })
    callStreamingMinutes: number;

    @Column({ type: 'int', default: 0 })
    callCameraMinutes: number;

    @Column({ type: 'int', default: 0 })
    dailyStreak: number;

    @Column({ type: 'timestamp', nullable: true })
    lastAttendedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    lastWorkedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    get level() {
        return xpToLevel(this.xp);
    }
}