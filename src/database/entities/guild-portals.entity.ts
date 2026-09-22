import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Guild } from './guild.entity'
import { User } from './user.entity'

export enum PortalType {
    GREEN = 'green',
    YELLOW = 'yellow',
    BLUE = 'blue',
    RED = 'red'
}

@Entity()
@Index(['guildId', 'userId'])
export class GuildPortal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'enum', enum: PortalType })
    type: PortalType;

    @Column({ type: 'varchar', nullable: true })
    userId: string | null;

    @Column({ type: 'integer' })
    duration: number;

    @Column({ type: 'integer', default: null })
    xpReward: number | null;

    @Column({ type: 'integer', default: null })
    coinReward: number | null;

    @Column({ type: 'timestamp', nullable: true })
    startAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User | null;

    get progress() {
        if (!this.userId || !this.startAt) {
            return 0
        }

        const elapsed = Date.now() - this.startAt.getTime();
        const durationMs = this.duration * 60 * 1000;

        return Math.min(Math.max(elapsed / durationMs, 0), 1);
    }

    get remainingTime() {
        if (!this.userId || !this.startAt) {
            return this.duration;
        }

        const elapsed = Date.now() - this.startAt.getTime();
        const durationMs = this.duration * 60 * 1000;
        const remainingMs = Math.max(durationMs - elapsed, 0);

        return Math.ceil(remainingMs / 1000);
    }

    get isExpired() {
        if (!this.userId || !this.startAt || this.progress > 0) {
            return false;
        }

        return Date.now() >= (this.startAt.getTime() + this.duration * 1000);
    }

    get isCompleted() {
        return this.progress >= 1;
    }
}