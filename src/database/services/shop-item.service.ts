import { db } from '../db'
import { ShopItem } from '../entities/shop-item.entity'
import { GuildService } from './guild.service'

interface ShopItemWhere {
    guildId: string;
    shopName: string;
    roleId: string;
}

export class ShopItemService {
    static get repo() {
        return db.getRepository(ShopItem);
    }

    // -- Utils -- //
    private static _buildWhere({ roleId, guildId }: ShopItemWhere) {
        return { guildId, roleId };
    }

    private static async _ensureGuild(guildId: string) {
        await GuildService.findOrCreate(guildId);
    }

    // -- CRUD -- //

    static async all(where: { guildId: string; shopName: string }) {
        return await this.repo.find({
            where: {
                guildId: where.guildId,
                shop: { name: where.shopName }
            },
            order: { cost: 'ASC' }
        });
    }

    static async allItems(guildId: string) {
        return await this.repo.find({
            where: { guildId },
            order: { cost: 'ASC' }
        });
    }

    static async addOrUpdate(where: ShopItemWhere, data: Partial<Omit<ShopItem, 'guildId' | 'roleId' | 'shop' | 'guild'>> & { cost: number; }) {
        await this._ensureGuild(where.guildId);

        await this.repo.upsert({
            ...this._buildWhere(where),
            ...data,
        }, ['guildId', 'roleId']);

        return await this.repo.findOneBy(this._buildWhere(where)) as ShopItem;
    }

    static async remove(where: ShopItemWhere) {
        return await this.repo.delete(this._buildWhere(where));
    }

    static async clear(guildId: string) {
        return await this.repo.delete({ guildId });
    }

    static async restock(where: ShopItemWhere, amount: number) {
        return await this.repo.increment(this._buildWhere(where), 'stock', amount);
    }

    static async decrementStock(where: ShopItemWhere, amount = 1) {
        const item = await this.repo.findOne({ where: this._buildWhere(where) });
        if (!item) {
            throw new Error('Cet item n\'existe pas');
        }

        if (typeof item.stock !== 'number') {
            throw new Error('Cet item ne possède pas de stock');
        }

        if (item.stock < amount) {
            throw new Error('Stock insuffisant');
        }

        return await this.repo.decrement(this._buildWhere(where), 'stock', amount);
    }
}