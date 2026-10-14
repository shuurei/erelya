import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { GuildMember } from './guild-member.entity'

@Entity()
export class GuildMemberItem {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @PrimaryColumn({ type: 'varchar' })
    userId: string;

    @PrimaryColumn({ type: 'varchar' })
    itemId: string;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'jsonb', default: {} })
    data: Record<string, unknown>;

    @ManyToOne(() => GuildMember, { onDelete: 'CASCADE' })
    @JoinColumn([
        { name: 'guildId', referencedColumnName: 'guildId' },
        { name: 'userId', referencedColumnName: 'userId' }
    ])
    member: GuildMember;
}