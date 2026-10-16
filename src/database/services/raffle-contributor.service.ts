import { db } from '@/database/db'
import { RaffleContributor } from '@/database/entities/raffle-contributor.entity'
import { GuildMemberService } from './guild-member.service'
import { DateTime } from 'luxon';

export interface RaffleContributorWhere {
    userId: string;
}

export interface RaffleContributorCreateWhere extends RaffleContributorWhere {
    guildId: string;
}

export class RaffleContributorService {
    static get repo() {
        return db.manager.getRepository(RaffleContributor);
    }

    // -- Utils --
    private static _buildWhere({ userId }: RaffleContributorWhere) {
        return { userId };
    }

    private static async ensureMember({ userId, guildId }: RaffleContributorCreateWhere) {
        return await GuildMemberService.findOrCreate({ userId, guildId });
    }

    // -- Queries --
    static async findById(where: RaffleContributorWhere) {
        return await this.repo.findOneBy(this._buildWhere(where));
    }

    static async count() {
        return await this.repo.count();
    }

    static async getTotalCoins() {
        const result = await this.repo
            .createQueryBuilder('contributor')
            .select('COALESCE(SUM(contributor.coins), 0)', 'total')
            .getRawOne<{ total: string }>();

        return Number(result?.total ?? 0);
    }

    // -- CRUD --
    static async joinRaffle(where: RaffleContributorCreateWhere, coins: number) {
        const contributor = {
            ...where,
            coins,
            contributionWeek: DateTime.now().setZone('Europe/Paris').startOf('week').toJSDate(),
            guildMember: await this.ensureMember(where)
        };

        await this.repo.upsert(contributor, {
            conflictPaths: ['userId'],
            skipUpdateIfNoValuesChanged: true
        });

        return await this.findById({ userId: where.userId });
    }

    static async update(where: RaffleContributorWhere, data: Partial<Omit<RaffleContributor, 'userId' | 'guildId' | 'guildMember'>>) {
        await this.repo.update(this._buildWhere(where), data);

        return await this.findById(where);
    }

    // -- Random winner --
    static async getRandomWinner() {
        const contributors = await this.repo.find();
        if (contributors.length === 0) {
            return null;
        }

        return contributors[Math.floor(Math.random() * contributors.length)];
    }

    // -- Remove --
    static async remove(where: RaffleContributorWhere) {
        return await this.repo.delete(this._buildWhere(where));
    }

    static async removeAll() {
        return await this.repo.clear();
    }
}