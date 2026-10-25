import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Guild } from './guild.entity'
import { User } from './user.entity'

export enum PortalRank {
    N = 'N',
    S = 'S',
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E'
}

export enum PortalType {
    GREEN = 'GREEN',
    YELLOW = 'YELLOW',
    BLUE = 'BLUE',
    RED = 'RED',
    BLACK = 'BLACK',
    PURPLE = 'PURPLE'
}

@Entity()
@Index(['guildId', 'userId'])
export class GuildPortal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'varchar', nullable: true })
    userId: string | null;

    @Column({ type: 'enum', enum: PortalRank })
    rank: PortalRank;

    @Column({ type: 'integer' })
    duration: number;

    @Column({ type: 'bool' })
    hasCoinReward: boolean;

    @Column({ type: 'bool' })
    hasXpReward: boolean;

    @Column({ type: 'bool', default: false })
    isStatsHidden: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    startAt: Date | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;

    @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'userId' })
    user: User | null;

    get type() {
        if (this.isStatsHidden) {
            return PortalType.BLACK;
        } else if (this.hasCoinReward && this.hasXpReward) {
            if (this.duration > 720) {
                return PortalType.PURPLE;
            } else if (this.duration > 90) {
                return PortalType.RED;
            } else {
                return PortalType.BLUE;
            }
        } else if (this.hasCoinReward) {
            return PortalType.YELLOW;
        } else if (this.hasXpReward) {
            return PortalType.GREEN;
        }
    }

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

    get expiringTime() {
        const elapsed = Date.now() - this.createdAt.getTime();
        const durationMs = this.duration * 60 * 1000;

        return Math.max(Math.ceil((durationMs - elapsed) / 1000), 0);
    }

    get isExpired() {
        if (this.userId) {
            return false;
        }

        return Date.now() >= (this.createdAt.getTime() + ((this.duration * 0.95) * 60 * 1000));
    }

    get isCompleted() {
        return this.progress >= 1;
    }
}