import { db } from '../db'
import { GuildLevelReward } from '../entities/guild-level-reward.entity'
import { GuildService } from './guild.service'

interface GuildLevelRewardWhere {
    guildId: string;
    atLevel: number;
}

export class GuildLevelRewardService {
    static get repo() {
        return db.manager.getRepository(GuildLevelReward);
    }
    
    // -- Utils -- //
    private static _buildWhere(where: GuildLevelRewardWhere) {
        return {
            guildId: where.guildId,
            atLevel: where.atLevel,
        };
    }

    private static async _ensureGuild(guildId: string) {
        return await GuildService.findOrCreate(guildId);
    }

    // -- CRUD -- //
    static async all(guildId: string) {
        return await this.repo.find({
            where: { guildId },
            order: { atLevel: 'ASC' }
        });
    }

    static async addOrUpdate(where: GuildLevelRewardWhere, data: Partial<GuildLevelReward>) {
        if (!data.coinsReward && !data.roleId) {
            return null;
        }

        await this._ensureGuild(where.guildId);

        await this.repo.upsert({
            ...this._buildWhere(where),
            ...data,
            isStackable: data.roleId
                ? data.isStackable ?? true
                : false,
        }, ['guildId', 'atLevel']);

        return await this.repo.findOneBy(this._buildWhere(where));
    }

    static async remove(where: GuildLevelRewardWhere) {
        return await this.repo.delete(this._buildWhere(where));
    }

    static async clear(guildId: string) {
        return await this.repo.delete({ guildId });
    }
}