import { db } from '../db'
import { Shop } from '../entities/shop.entity'
import { GuildService } from './guild.service'

interface ShopWhere {
    guildId: string;
    name: string;
}

export class ShopService {
    static get repo() {
        return db.getRepository(Shop);
    }

    // -- Utils -- //
    private static _buildWhere(where: ShopWhere) {
        return {
            guildId: where.guildId,
            name: where.name,
        };
    }

    private static async _ensureGuild(guildId: string) {
        return await GuildService.findOrCreate(guildId);
    }

    // -- CRUD -- //
    static async all(guildId: string) {
        return await this.repo.find({ where: { guildId } });
    }

    static async findById(where: ShopWhere) {
        return await this.repo.findOneBy(this._buildWhere(where));
    }

    static async addOrUpdate(where: ShopWhere, data: Partial<Omit<Shop, 'guildId' | 'name'>>) {
        await this._ensureGuild(where.guildId);

        await this.repo.upsert({
            ...this._buildWhere(where),
            ...data,
        }, ['guildId', 'name']);

        return await this.findById(where) as Shop;
    }

    static async remove(where: ShopWhere) {
        return await this.repo.delete(this._buildWhere(where));
    }

    static async clear(guildId: string) {
        return await this.repo.delete({ guildId });
    }
}