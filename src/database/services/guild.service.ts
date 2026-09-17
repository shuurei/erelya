import { db } from '../db'

import { Guild } from '../entities/guild.entity'

export class GuildService {
    static get repo() {
        return db.manager.getRepository(Guild);
    }

    // -- CRUD --
    static async findById(guildId: string) {
        return await this.repo.findOneBy({ id: guildId });
    }

    static async findOrCreate(guildId: string, data: Partial<Omit<Guild, 'id'>> = {}) {
        let guild = await this.findById(guildId);
        if (!guild) {
            guild = this.repo.create({
                id: guildId,
                ...data
            });

            await this.repo.save(guild);
        }

        return guild;
    }

    static async createOrUpdate(guildId: string, data: Partial<Omit<Guild, 'id'>>) {
        await this.repo.upsert({
            id: guildId,
            ...data
        }, ['id']);

        return await this.findById(guildId);
    }

    static async create(guildId: string, data: Partial<Omit<Guild, 'id'>> = {}) {
        const guild = this.repo.create({
            id: guildId,
            ...data
        });

        return await this.repo.save(guild);
    }

    static async update(guildId: string, data: Partial<Omit<Guild, 'id'>>) {
        await this.repo.update({ id: guildId }, data);

        return await this.findById(guildId);
    }

    static async delete(guildId: string) {
        return await this.repo.delete({ id: guildId });
    }

    // -- Setters --
    static async setWelcomeChannel(guildId: string, channelId: string | null) {
        return await this.createOrUpdate(guildId, { welcomeChannelId: channelId });
    }

    static async setSupportRole(guildId: string, roleId: string | null) {
        return await this.createOrUpdate(guildId, { supportRoleId: roleId });
    }

    static async setMessageDeletedAuditChannel(guildId: string, channelId: string | null) {
        return await this.createOrUpdate(guildId, { messageDeletedAuditChannelId: channelId });
    }

    static async setMessageEditedAuditChannel(guildId: string, channelId: string | null) {
        return await this.createOrUpdate(guildId, { messageEditedAuditChannelId: channelId });
    }

    static async setLastEventAt(guildId: string, date: Date | null = new Date()) {
        return await this.createOrUpdate(guildId, { lastEventAt: date });
    }
}