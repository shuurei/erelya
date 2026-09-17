import { db } from '../db'
import { User } from '../entities/user.entity'
import { UserDatabaseFlagsString } from '@/utils/user-flags'

export class UserService {
    static get repo() {
        return db.manager.getRepository(User);
    }

    static async findById(userId: string) {
        return await this.repo.findOneBy({ id: userId });
    }

    static async findOrCreate(userId: string, data: Partial<Omit<User, 'id'>> = {}) {
        let user = await this.findById(userId)
        if (!user) {
            user = this.repo.create({
                id: userId,
                ...data
            });

            await this.repo.save(user);
        }

        return user;
    }

    static async createOrUpdate(userId: string, data: Partial<Omit<User, 'id'>>) {
        await this.repo.upsert({
            id: userId,
            ...data
        }, ['id']);

        return await this.findById(userId);
    }

    static async create(userId: string, data: Partial<Omit<User, 'id'>> = {}) {
        const user = this.repo.create({
            id: userId,
            ...data
        });

        return await this.repo.save(user);
    }

    static async update(userId: string, data: Partial<Omit<User, 'id'>>) {
        await this.repo.update({ id: userId }, data);

        return await this.findById(userId);
    }

    static async delete(userId: string) {
        return await this.repo.delete({ id: userId });
    }

    // -- Flags --
    static async addFlag(userId: string, flag: UserDatabaseFlagsString) {
        const user = await this.findOrCreate(userId);

        user.flags = user.flagsBitField.add(flag).bitfield;

        return await this.repo.save(user);
    }

    static async removeFlag(userId: string, flag: UserDatabaseFlagsString) {
        const user = await this.findById(userId);
        if (!user) {
            return null
        }

        user.flags = user.flagsBitField.remove(flag).bitfield;

        return await this.repo.save(user);
    }

    // -- Tag --
    static async setTagAssignedAt(userId: string, date: Date = new Date()) {
        return await this.createOrUpdate(userId, {
            tagAssignedAt: date
        });
    }

    static async resetTagAssignedAt(userId: string) {
        return await this.createOrUpdate(userId, {
            tagAssignedAt: null
        });
    }
}