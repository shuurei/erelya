import { db } from '@/database/db'
import { GuildMemberDailyQuest } from '@/database/entities/guild-member/daily-quest.entity'
import { GuildMemberService } from './guild-member.service'

export interface MemberDailyQuestWhere {
    guildId: string
    userId: string
}

export class GuildMemberDailyQuestService {
    static get repo() {
        return db.manager.getRepository(GuildMemberDailyQuest)
    }

    // -- Utils --
    private static _buildWhere({ userId, guildId }: MemberDailyQuestWhere) {
        return { userId, guildId }
    }

    private static async ensureMember({ userId, guildId }: MemberDailyQuestWhere) {
        return await GuildMemberService.findOrCreate({ userId, guildId });
    }

    // -- CRUD --
    static async findById(where: MemberDailyQuestWhere) {
        return await this.repo.findOneBy(this._buildWhere(where));
    }

    static async create(where: MemberDailyQuestWhere, data: Partial<Omit<GuildMemberDailyQuest, 'userId' | 'guildId'>> = {}) {
        const quest = this.repo.create({
            ...where,
            ...data,
            guildMember: await this.ensureMember(where)
        });

        return await this.repo.save(quest);
    }

    static async findOrCreate(where: MemberDailyQuestWhere, data: Partial<Omit<GuildMemberDailyQuest, 'userId' | 'guildId'>> = {}) {
        await this.repo.upsert({
            ...where,
            ...data,
            guildMember: await this.ensureMember(where),
        }, { conflictPaths: ['userId', 'guildId'], skipUpdateIfNoValuesChanged: true })

        return await this.findById(where) as GuildMemberDailyQuest;
    }

    static async updateOrCreate(where: MemberDailyQuestWhere, data: Partial<Omit<GuildMemberDailyQuest, 'userId' | 'guildId'>> = {}) {
        await this.repo.upsert(
            {
                ...where,
                ...data,
                guildMember: await this.ensureMember(where),
            },
            { conflictPaths: ['userId', 'guildId'], skipUpdateIfNoValuesChanged: true }
        );

        return await this.findById(where) as GuildMemberDailyQuest;
    }

    static async remove(where: MemberDailyQuestWhere) {
        return await this.repo.delete(this._buildWhere(where));
    }
}