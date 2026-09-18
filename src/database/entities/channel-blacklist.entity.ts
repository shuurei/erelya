import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Guild } from './guild.entity'

export enum BlacklistScope {
    LEVEL = 'LEVEL',
    ECONOMY = 'ECONOMY',
    COMMAND = 'COMMAND',
    QUEST = 'QUEST',
    MESSAGE = 'MESSAGE'
}

@Entity()
export class ChannelBlacklist {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @PrimaryColumn({ type: 'varchar' })
    channelId: string;

    @PrimaryColumn({ type: 'enum', enum: BlacklistScope })
    scope: BlacklistScope;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;
}