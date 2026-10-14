import { db } from '../db'

import { GuildMemberItem } from '../entities/guild-member-item.entity'

interface MemberItemWhere {
    guildId: string;
    userId: string;
    itemId: string;
}

interface ItemQuantityOptions {
    min?: number;
    max?: number;
}

export class GuildMemberItemService {
    static get repo() {
        return db.manager.getRepository(GuildMemberItem);
    }

    // -- Utils --
    private static _buildWhere(where: MemberItemWhere) {
        return {
            guildId: where.guildId,
            userId: where.userId,
            itemId: where.itemId
        }
    }

    private static async _updateQuantity(where: MemberItemWhere, amount: number, options: ItemQuantityOptions = {}) {
        const item = await this.findById(where);
        if (!item) {
            if (amount <= 0) return null;

            return await this.create(where, {
                quantity: Math.min(Math.max(amount, options.min ?? 0), options.max ?? Infinity)
            });
        }

        const newQuantity = Math.min(Math.max(item.quantity + amount, options.min ?? 0), options.max ?? Infinity);
        if (newQuantity <= 0) {
            await this.delete(where);
            return null;
        }

        return await this.update(where, { quantity: newQuantity });
    }

    private static async _setQuantity(where: MemberItemWhere, quantity: number, options: ItemQuantityOptions = {}) {
        const newQuantity = Math.min(Math.max(quantity, options.min ?? 0), options.max ?? Infinity);
        if (newQuantity <= 0) {
            await this.delete(where);
            return null;
        }

        return await this.updateOrCreate(where, { quantity: newQuantity });
    }

    // -- CRUD --
    static async findById(where: MemberItemWhere) {
        return await this.repo.findOneBy(this._buildWhere(where));
    }

    static async findAll({ guildId, userId }: Omit<MemberItemWhere, 'itemId'>) {
        return await this.repo.find({
            where: { guildId, userId }
        });
    }

    static async updateOrCreate(where: MemberItemWhere, data: Partial<Omit<GuildMemberItem, keyof MemberItemWhere>>) {
        await this.repo.upsert({ ...where, ...data }, {
            conflictPaths: ['guildId', 'userId', 'itemId'],
            skipUpdateIfNoValuesChanged: true
        });

        return await this.findById(where) as GuildMemberItem;
    }

    static async create(where: MemberItemWhere, data: Partial<Omit<GuildMemberItem, keyof MemberItemWhere>> = {}) {
        const item = this.repo.create({ ...where, ...data });

        return await this.repo.save(item);
    }

    static async update(where: MemberItemWhere, data: Partial<Omit<GuildMemberItem, keyof MemberItemWhere>>) {
        await this.repo.update(this._buildWhere(where), data);

        return await this.findById(where);
    }

    static async delete(where: MemberItemWhere) {
        return await this.repo.delete(this._buildWhere(where));
    }

    // -- Quantity --
    static async add(where: MemberItemWhere, quantity = 1, options?: ItemQuantityOptions) {
        return await this._updateQuantity(where, quantity, options);
    }

    static async remove(where: MemberItemWhere, quantity = 1, options?: ItemQuantityOptions) {
        return await this._updateQuantity(where, -quantity, options);
    }

    static async setQuantity(where: MemberItemWhere, quantity: number, options?: ItemQuantityOptions) {
        return await this._setQuantity(where, quantity, options);
    }

    static async has(where: MemberItemWhere, quantity = 1) {
        const item = await this.findById(where);

        return !!item && item.quantity >= quantity;
    }

    // -- Data --
    static async updateData(where: MemberItemWhere, data: Record<string, unknown>) {
        const item = await this.findById(where);
        if (!item) {
            return await this.create(where, {
                data
            });
        }

        return await this.update(where, {
            data: { ...item.data, ...data }
        });
    }

    static async setData(where: MemberItemWhere, data: Record<string, unknown>) {
        return await this.updateOrCreate(where, { data });
    }
}