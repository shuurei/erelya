import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, CreateDateColumn } from 'typeorm'

import { Guild } from './guild.entity'
import { Shop } from './shop.entity'

@Entity()
export class ShopItem {
    @PrimaryColumn({ type: 'varchar' })
    guildId: string;

    @PrimaryColumn({ type: 'varchar' })
    roleId: string;

    @Column({ type: 'string' })
    shopName: string;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @Column({ type: 'int' })
    cost: number;

    @Column({ type: 'int', nullable: true })
    stock?: number | null;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Shop, { onDelete: 'CASCADE' })
    @JoinColumn([
        { name: 'guildId', referencedColumnName: 'guildId' },
        { name: 'shopName', referencedColumnName: 'name' },
    ])
    shop: Shop;

    @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'guildId' })
    guild: Guild;
}