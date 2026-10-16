import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm'
import { GuildMember } from './guild-member.entity'

@Entity()
export class RaffleContributor {
    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @Column({ type: 'varchar' })
    guildId: string;

    @Column({ type: 'integer' })
    coins: number;

    @Column({ type: 'date' })
    contributionWeek: Date;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => GuildMember, { onDelete: 'CASCADE' })
    @JoinColumn([
        { name: 'userId', referencedColumnName: 'userId' },
        { name: 'guildId', referencedColumnName: 'guildId' }
    ])
    guildMember: GuildMember;
}