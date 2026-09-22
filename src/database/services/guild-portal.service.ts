import { db } from '@/database/db'
import { GuildPortal } from '../entities/guild-portals.entity'
import { GuildMemberService } from './guild-member.service'
import { UserService } from './user.service'

export interface GuildPortalWhere {
    id: number
}

export interface GuildPortalGuildWhere {
    guildId: string
}

export interface GuildPortalUserWhere {
    guildId: string
    userId: string
}

export class GuildPortalService {
    static get repo() {
        return db.manager.getRepository(GuildPortal);
    }

    // -- CRUD --
    static async findById({ id }: GuildPortalWhere) {
        return await this.repo.findOneBy({ id });
    }

    static async findByGuild({ guildId }: GuildPortalGuildWhere) {
        return await this.repo.find({
            where: { guildId },
            order: { createdAt: 'ASC' }
        });
    }

    static async findByUser({ guildId, userId }: GuildPortalUserWhere) {
        return await this.repo.findOneBy({ guildId, userId });
    }

    static async create(guildId: string, data: Partial<Omit<GuildPortal, 'id' | 'guildId'>>) {
        const portal = this.repo.create({
            guildId,
            userId: null,
            ...data
        });

        return await this.repo.save(portal);
    }

    static async update({ id }: GuildPortalWhere, data: Partial<Omit<GuildPortal, 'id' | 'guildId'>>) {
        await this.repo.update({ id }, data);

        return await this.findById({ id });
    }

    static async remove({ id }: GuildPortalWhere) {
        return await this.repo.delete({ id });
    }

    static async assign(id: number, userId: string) {
        const portal = await this.findById({ id });
        if (!portal || portal.user) {
            return null
        }

        await UserService.findOrCreate(userId);

        return await this.update({ id }, { userId, startAt: new Date() });
    }

    static async complete({ id }: GuildPortalWhere, userId: string) {
        const portal = await this.findById({ id });
        if (!portal || !portal.userId) return;

        await Promise.all([
            this.repo.delete({ id }),
            GuildMemberService.incrementPortalCompleted({ userId: portal.userId, guildId: portal.guildId })
        ]);
    }
}