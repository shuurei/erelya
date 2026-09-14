import db from '@/database/db'
import {
    MemberModel,
    MemberUpdateInput,
    MemberCreateInput,
    UserCreateOrConnectWithoutGuildsInput,
    GuildCreateOrConnectWithoutMembersInput,
    MemberFindUniqueArgs,
    MemberGetPayload,
    MemberUpsertArgs,
    MemberWhereUniqueInput,
} from '@/database/core/models'
import { Prisma } from '../core/client'

export type MemberCreateInputWithoutUserAndGuild = Omit<MemberCreateInput, 'user' | 'guild'>

interface MemberWhere {
    guildId: string
    userId: string
}

interface BaseNumberFieldData {
    field: keyof MemberModel
}

interface NumberFieldUpdateData extends BaseNumberFieldData {
    amount: number;
}

interface NumberFieldSetData extends BaseNumberFieldData {
    value: number;
}

interface NumberFieldOptions {
    max?: number
    min?: number
}

class MemberService {
    constructor(public model: typeof db.member) { }

    // -- Utils -- //
    private _buildWhere(where: MemberWhere) {
        return { userId_guildId: where }
    }

    private _connectOrCreateUserAndGuild(where: MemberWhere) {
        const { userId, guildId } = where;

        return {
            user: {
                connectOrCreate: {
                    where: { id: userId },
                    create: { id: userId }
                }
            } as unknown as UserCreateOrConnectWithoutGuildsInput,
            guild: {
                connectOrCreate: {
                    where: { id: guildId },
                    create: { id: guildId }
                }
            } as unknown as GuildCreateOrConnectWithoutMembersInput
        }
    }

    private async _updateNumberField(
        where: MemberWhere,
        data: NumberFieldUpdateData,
        options?: NumberFieldOptions
    ) {
        const member = await this.findOrCreate(where);

        const currentValue = member[data.field] as number;
        const newValue = Math.clamp(currentValue + data.amount, options?.min ?? 0, options?.max ?? Infinity);

        return await this.update(where, {
            [data.field]: newValue
        });
    }

    private async _setNumberField(
        where: MemberWhere,
        data: NumberFieldSetData,
        options?: NumberFieldOptions
    ) {
        return this.updateOrCreate(where, {
            [data.field]: Math.clamp(data.value, options?.min ?? 0, options?.max ?? Infinity)
        });
    }

    private async _setColdown(
        where: MemberWhere,
        field: keyof MemberModel,
        date: Date | undefined,
    ) {
        if (date === undefined) {
            date = new Date();
        }

        return await this.updateOrCreate(where, {
            [field]: date
        });
    }

    // -- CRUD -- //
    async findById<Options extends Omit<MemberFindUniqueArgs, 'where'>>(
        where: MemberWhere,
        options?: Options
    ) {
        return await this.model.findUnique({
            ...options,
            where: this._buildWhere(where)
        }) as Prisma.Result<typeof this.model, Options & { where: MemberWhereUniqueInput }, 'findUnique'>
    }

    async findOrCreate<Options extends Omit<MemberUpsertArgs, 'where' | 'update' | 'create'>>(
        where: MemberWhere,
        options?: Options & {
            data?: Partial<MemberCreateInputWithoutUserAndGuild>
        },
    ) {
        const { data, ...props } = options ?? {}

        return await this.model.upsert({
            ...props,
            where: this._buildWhere(where),
            update: {},
            create: {
                ...data,
                ...this._connectOrCreateUserAndGuild(where)
            }
        }) as unknown as MemberGetPayload<Options>
    }

    async updateOrCreate<Options extends Omit<MemberUpsertArgs, 'where' | 'update' | 'create'>>(
        where: MemberWhere,
        data: Partial<MemberCreateInputWithoutUserAndGuild>,
        options?: Options
    ) {
        return await this.model.upsert({
            ...options,
            where: this._buildWhere(where),
            update: data,
            create: {
                ...data,
                ...this._connectOrCreateUserAndGuild(where)
            }
        }) as unknown as MemberGetPayload<Options>
    }

    async create(where: MemberWhere, data?: MemberCreateInputWithoutUserAndGuild) {
        return await this.model.create({
            data: {
                ...this._connectOrCreateUserAndGuild(where),
                ...data
            }
        })
    }

    async update(where: MemberWhere, data: MemberUpdateInput) {
        return await this.model.update({
            where: this._buildWhere(where),
            data
        });
    }

    async delete(where: MemberWhere) {
        return await this.model.delete({ where: this._buildWhere(where) });
    }

    // -- Activity XP -- //
    async addActivityXp(where: MemberWhere, amount: number, options?: NumberFieldOptions) {
        return await this._updateNumberField(where, {
            field: 'activityXp',
            amount
        }, options);
    }

    async removeActivityXp(where: MemberWhere, amount: number, options?: NumberFieldOptions) {
        return await this._updateNumberField(where, {
            field: 'activityXp',
            amount: -amount
        }, options);
    }

    async setActivityXp(where: MemberWhere, value: number, options?: NumberFieldOptions) {
        return await this._setNumberField(where, {
            field: 'activityXp',
            value
        }, options);
    }

    // -- Guild Points -- //
    async addGuildCoins(where: MemberWhere, amount: number, options?: NumberFieldOptions) {
        return await this._updateNumberField(where, {
            field: 'guildCoins',
            amount
        }, options);
    }

    async removeGuildCoins(where: MemberWhere, amount: number, options?: NumberFieldOptions) {
        return await this._updateNumberField(where, {
            field: 'guildCoins',
            amount: -amount
        }, options);
    }

    async setGuildCoins(where: MemberWhere, value: number, options?: NumberFieldOptions) {
        return await this._setNumberField(where, {
            field: 'guildCoins',
            value
        }, options);
    }

    // -- Stats -- //
    async incrementCallPublicTime(where: MemberWhere, minutes?: number) {
        return await this._updateNumberField(where, {
            field: 'callPublicMinutes',
            amount: minutes ?? 1
        });
    }

    async incrementCallPrivateTime(where: MemberWhere, minutes?: number) {
        return await this._updateNumberField(where, {
            field: 'callPrivateMinutes',
            amount: minutes ?? 1
        });
    }

    async incrementCallActiveTime(where: MemberWhere, minutes?: number) {
        return await this._updateNumberField(where, {
            field: 'callActiveMinutes',
            amount: minutes ?? 1
        });
    }

    async incrementCallDeafTime(where: MemberWhere, minutes?: number) {
        return await this._updateNumberField(where, {
            field: 'callDeafMinutes',
            amount: minutes ?? 1
        });
    }

    async incrementCallMutedTime(where: MemberWhere, minutes?: number) {
        return await this._updateNumberField(where, {
            field: 'callMutedMinutes',
            amount: minutes ?? 1
        });
    }

    async incrementCallStreamingTime(where: MemberWhere, minutes?: number) {
        return await this._updateNumberField(where, {
            field: 'callStreamingMinutes',
            amount: minutes ?? 1
        });
    }

    async incrementCallCameraTime(where: MemberWhere, minutes?: number) {
        return await this._updateNumberField(where, {
            field: 'callCameraMinutes',
            amount: minutes ?? 1
        });
    }

    async incrementMessageCount(where: MemberWhere, amount?: number) {
        return await this._updateNumberField(where, {
            field: 'messageCount',
            amount: amount ?? 1
        });
    }

    async incrementDailyStreak(where: MemberWhere) {
        return await this._updateNumberField(where, {
            field: 'dailyStreak',
            amount: 1
        });
    }

    async resetDailyStreak(where: MemberWhere) {
        return await this._setNumberField(where, {
            field: 'dailyStreak',
            value: 1
        });
    }

    async resetStats(where: MemberWhere) {
        return await this.updateOrCreate(where, {
            callActiveMinutes: 0,
            callDeafMinutes: 0,
            callMutedMinutes: 0,
            messageCount: 0,
            dailyStreak: 0
        });
    }

    // -- Cooldowns -- //
    async setLastAttendedAt(where: MemberWhere, date?: Date | undefined) {
        return await this._setColdown(where, 'lastAttendedAt', date);
    }

    async setLastWorkedAt(where: MemberWhere, date?: Date | undefined) {
        return await this._setColdown(where, 'lastWorkedAt', date);
    }

    async setLastRobAt(where: MemberWhere, date?: Date | undefined) {
        return await this._setColdown(where, 'lastRobAt', date);
    }

    async setLastRobbedAt(where: MemberWhere, date?: Date | undefined) {
        return await this._setColdown(where, 'lastRobbedAt', date);
    }

    async setLastHeistAt(where: MemberWhere, date?: Date | undefined) {
        return await this._setColdown(where, 'lastHeistAt', date);
    }

    async setLastHeistedAt(where: MemberWhere, date?: Date | undefined) {
        return await this._setColdown(where, 'lastHeistedAt', date);
    }

    async resetAllColdowns(where: MemberWhere) {
        return await this.updateOrCreate(where, {
            lastAttendedAt: null,
            lastWorkedAt: null,
            lastRobbedAt: null,
        });
    }

    // -- Leaderboard -- //
    async getActivityXpRank(where: MemberWhere) {
        const member = await this.findOrCreate(where);

        const [higher, total] = await Promise.all([
            this.model.count({
                where: {
                    guildId: where.guildId,
                    activityXp: { gt: member.activityXp }
                }
            }),
            this.model.count({
                where: {
                    guildId: where.guildId,
                    activityXp: { gt: 0 }
                }
            })
        ]);

        return {
            rank: higher + 1,
            total
        };
    }
}

export const memberService = new MemberService(db.member);