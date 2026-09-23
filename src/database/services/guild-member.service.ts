import { MoreThan } from 'typeorm'
import { db } from '../db'

import { GuildMember } from '../entities/guild-member.entity'

import { UserService } from './user.service'
import { GuildService } from './guild.service'
import { PortalType } from '../entities/guild-portals.entity'

interface MemberWhere {
    guildId: string;
    userId: string;
}

interface NumberFieldOptions {
    min?: number;
    max?: number;
}

export class GuildMemberService {
    static get repo() {
        return db.manager.getRepository(GuildMember);
    }

    // -- Utils --
    private static async ensureUserAndGuild({ userId, guildId }: MemberWhere) {
        const [user, guild] = await Promise.all([
            UserService.findOrCreate(userId),
            GuildService.findOrCreate(guildId)
        ]);

        return { user, guild };
    }

    private static _buildWhere(where: MemberWhere) {
        return {
            userId: where.userId,
            guildId: where.guildId
        }
    }

    private static async _updateNumberField(
        where: MemberWhere,
        field: keyof GuildMember,
        amount: number,
        options: NumberFieldOptions = {}
    ) {
        const member = await this.findOrCreate(where);

        const currentValue = member[field] as number;

        const newValue = Math.min(
            Math.max(currentValue + amount, options.min ?? 0),
            options.max ?? Infinity
        );

        return await this.update(where, { [field]: newValue }) as GuildMember;
    }

    private static async _setNumberField(
        where: MemberWhere,
        field: keyof GuildMember,
        value: number,
        options: NumberFieldOptions = {}
    ) {
        const newValue = Math.min(
            Math.max(value, options.min ?? 0),
            options.max ?? Infinity
        );

        return await this.updateOrCreate(where, { [field]: newValue });
    }

    private static async _setCooldown(where: MemberWhere, field: keyof GuildMember, date?: Date) {
        return await this.updateOrCreate(where, { [field]: date ?? new Date() });
    }

    // -- CRUD --
    static async findById(where: MemberWhere) {
        return await this.repo.findOneBy(this._buildWhere(where));
    }

    static async findOrCreate(where: MemberWhere, data: Partial<Omit<GuildMember, 'userId' | 'guildId'>> = {}) {
        await this.repo.upsert({
            ...where,
            ...data,
            ...await this.ensureUserAndGuild(where)
        }, { conflictPaths: ['userId', 'guildId'], skipUpdateIfNoValuesChanged: true });

        return await this.repo.findOneBy(where) as GuildMember;
    }

    static async updateOrCreate(where: MemberWhere, data: Partial<Omit<GuildMember, 'userId' | 'guildId'>>) {
        await this.repo.upsert({
            ...where,
            ...data,
            ...await this.ensureUserAndGuild(where),
        }, { conflictPaths: ['userId', 'guildId'], skipUpdateIfNoValuesChanged: true });

        return await this.repo.findOneBy(where) as GuildMember;
    }

    static async create(where: MemberWhere, data: Partial<Omit<GuildMember, 'userId' | 'guildId'>> = {}) {
        const member = this.repo.create({
            ...where,
            ...data
        });

        return await this.repo.save(member);
    }

    static async update(where: MemberWhere, data: Partial<Omit<GuildMember, 'userId' | 'guildId'>>) {
        await this.repo.update(this._buildWhere(where), data);

        return await this.findById(where);
    }

    static async delete(where: MemberWhere) {
        return await this.repo.delete(this._buildWhere(where));
    }

    // -- XP --
    static async addXp(where: MemberWhere, amount: number, options?: NumberFieldOptions) {
        return await this._updateNumberField(where, 'xp', amount, options);
    }

    static async removeXp(where: MemberWhere, amount: number, options?: NumberFieldOptions) {
        return await this._updateNumberField(where, 'xp', -amount, options);
    }

    static async setXp(where: MemberWhere, value: number, options?: NumberFieldOptions) {
        return await this._setNumberField(where, 'xp', value, options);
    }

    // -- Coins --
    static async addCoins(where: MemberWhere, amount: number, options?: NumberFieldOptions) {
        return await this._updateNumberField(where, 'coins', amount, options);
    }

    static async removeCoins(where: MemberWhere, amount: number, options?: NumberFieldOptions) {
        return await this._updateNumberField(where, 'coins', -amount, options);
    }

    static async setCoins(where: MemberWhere, value: number, options?: NumberFieldOptions) {
        return await this._setNumberField(where, 'coins', value, options);
    }

    // -- Stats --
    static async incrementCallPublicTime(where: MemberWhere, minutes = 1) {
        return await this._updateNumberField(where, 'callPublicMinutes', minutes);
    }

    static async incrementCallPrivateTime(where: MemberWhere, minutes = 1) {
        return await this._updateNumberField(where, 'callPrivateMinutes', minutes);
    }

    static async incrementCallActiveTime(where: MemberWhere, minutes = 1) {
        return await this._updateNumberField(where, 'callActiveMinutes', minutes);
    }

    static async incrementCallDeafTime(where: MemberWhere, minutes = 1) {
        return await this._updateNumberField(where, 'callDeafMinutes', minutes);
    }

    static async incrementCallMutedTime(where: MemberWhere, minutes = 1) {
        return await this._updateNumberField(where, 'callMutedMinutes', minutes);
    }

    static async incrementCallStreamingTime(where: MemberWhere, minutes = 1) {
        return await this._updateNumberField(where, 'callStreamingMinutes', minutes);
    }

    static async incrementCallCameraTime(where: MemberWhere, minutes = 1) {
        return await this._updateNumberField(where, 'callCameraMinutes', minutes);
    }

    static async incrementMessageCount(where: MemberWhere, amount = 1) {
        return await this._updateNumberField(where, 'messageCount', amount);
    }

    static async incrementPortalCompleted(where: MemberWhere, type: PortalType) {
        return await this._updateNumberField(where, `${type}PortalCompleted`, 1);
    }

    static async incrementDailyStreak(where: MemberWhere) {
        return await this._updateNumberField(where, 'dailyStreak', 1);
    }

    static async incrementPortalEntriesToday(where: MemberWhere) {
        return await this._updateNumberField(where, 'portalEntriesToday', 1);
    }

    static async resetDailyStreak(where: MemberWhere) {
        return await this._setNumberField(where, 'dailyStreak', 1);
    }

    static async resetportalEntriesToday(where: MemberWhere) {
        return await this._setNumberField(where, 'portalEntriesToday', 0);
    }

    static async resetStats(where: MemberWhere) {
        return await this.updateOrCreate(where, {
            callActiveMinutes: 0,
            callDeafMinutes: 0,
            callMutedMinutes: 0,
            messageCount: 0,
            dailyStreak: 0
        });
    }

    // -- Cooldowns --
    static async setLastAttendedAt(where: MemberWhere, date?: Date) {
        return await this._setCooldown(where, 'lastAttendedAt', date);
    }

    static async setLastPortalEntryAt(where: MemberWhere, date?: Date) {
        return await this._setCooldown(where, 'lastPortalEntryAt', date);
    }

    static async setLastWorkedAt(where: MemberWhere, date?: Date) {
        return await this._setCooldown(where, 'lastWorkedAt', date);
    }

    static async resetAllCooldowns(where: MemberWhere) {
        return await this.updateOrCreate(where, {
            lastAttendedAt: null,
            lastWorkedAt: null,
        });
    }

    // -- Leaderboard --
    static async getActivityXpRank(where: MemberWhere) {
        const member = await this.findById(where);
        if (!member) {
            return null
        }

        const [higher, total] = await Promise.all([
            this.repo.count({
                where: {
                    guildId: where.guildId,
                    xp: MoreThan(member.xp)
                }
            }),
            this.repo.count({
                where: {
                    guildId: where.guildId,
                    xp: MoreThan(0)
                }
            })
        ]);

        return {
            rank: higher + 1,
            total
        }
    }
}