import { In } from 'typeorm'

import { db } from '../db'
import { BlacklistScope, ChannelBlacklist } from '../entities/channel-blacklist.entity'

interface ChannelBlacklistWhere {
    guildId: string;
    channelId: string;
    scope: BlacklistScope;
}

export class ChannelBlacklistService {
    static get repo() {
        return db.manager.getRepository(ChannelBlacklist);
    }

    // -- Utils --
    private static _buildWhere({ guildId, channelId, scope }: ChannelBlacklistWhere) {
        return { guildId, channelId, scope }
    }

    // -- CRUD --
    static async findMany({ guildId, channelId }: { guildId: string; channelId: string; }) {
        const rows = await this.repo.find({
            where: { guildId, channelId }
        });

        return rows.reduce<Partial<Record<BlacklistScope, boolean>>>((acc, { scope }) => {
            acc[scope] = true
            return acc
        }, {});
    }

    static async has(where: ChannelBlacklistWhere) {
        return !!(await this.repo.findOneBy(this._buildWhere(where)));
    }

    static async hasAny(where: {
        guildId: string;
        scope: BlacklistScope;
        channelIds: string[];
    }) {
        if (!where.channelIds.length) {
            return false
        }

        const channel = await this.repo.findOne({
            where: {
                guildId: where.guildId,
                scope: where.scope,
                channelId: In(where.channelIds)
            }
        })

        return !!channel
    }

    static async add(where: ChannelBlacklistWhere) {
        await this.repo.upsert(this._buildWhere(where), ['guildId', 'channelId', 'scope']);

        return await this.repo.findOneBy(this._buildWhere(where));
    }

    static async remove(where: ChannelBlacklistWhere) {
        return await this.repo.delete(this._buildWhere(where));
    }

    static async clear(where: {
        guildId: string
        scope: BlacklistScope
        channelId?: string
    }) {
        return await this.repo.delete({
            guildId: where.guildId,
            scope: where.scope,
            ...(where.channelId
                ? { channelId: where.channelId }
                : {}),
        });
    }
}