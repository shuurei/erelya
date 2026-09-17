import { DeepPartial, FindOptionsWhere, Repository, QueryDeepPartialEntity } from 'typeorm' 

import { db } from '../db'
import * as GuildModules from '../entities/guild-module'
import { GuildService } from './guild.service'

type EntityOf<R> = R extends Repository<infer E> ? E : never;
export type GuildModuleName = keyof typeof GuildModuleService.repos;
export type GuildModuleEntity<T extends GuildModuleName> = EntityOf<(typeof GuildModuleService.repos)[T]>;

export type BooleanKeys<T> = {
    [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

export class GuildModuleService {
    static get repos() {
        return {
            economy: db.manager.getRepository(GuildModules.EconomyModule),
            level: db.manager.getRepository(GuildModules.LevelModule),
            event: db.manager.getRepository(GuildModules.EventModule),
            quest: db.manager.getRepository(GuildModules.QuestModule),
        } as const;
    }

    // -- Utils --
    private static getRepo<T extends GuildModuleName>(moduleName: T) {
        return this.repos[moduleName] as Repository<GuildModuleEntity<T>>;
    }

    // -- CRUD --
    static async findByName<T extends GuildModuleName>(guildId: string, moduleName: T) {
        return await this.getRepo(moduleName).findOneBy({ guildId } as FindOptionsWhere<GuildModuleEntity<T>>) as GuildModuleEntity<T> | null;
    }

    static async findMany<T extends GuildModuleName[]>(guildId: string, moduleNames: T) {
        const entries = await Promise.all(moduleNames.map(async (moduleName) => [
            moduleName,
            await this.findOrCreate(guildId, moduleName)
        ] as const));

        return Object.fromEntries(entries) as {
            [P in T[number]]: GuildModuleEntity<P>
        };
    }

    static async findOrCreate<T extends GuildModuleName>(guildId: string, moduleName: T) {
        const exist = await this.findByName(guildId, moduleName);
        if (exist) {
            return exist;
        }

        const guild = await GuildService.findOrCreate(guildId);
        const repo = this.getRepo(moduleName);

        const module = repo.create({ guild, guildId } as DeepPartial<GuildModuleEntity<T>>);

        return await repo.save(module);
    }

    static async updateOrCreate<T extends GuildModuleName>(guildId: string, moduleName: T, data: Partial<GuildModuleEntity<T>>) {
        const repo = this.getRepo(moduleName);
        await GuildService.findOrCreate(guildId);

        await repo.upsert(
            { guildId, ...data } as QueryDeepPartialEntity<GuildModuleEntity<T>>,
            ['guildId']
        );

        return await this.findByName(guildId, moduleName) as GuildModuleEntity<T>;
    }

    // -- Utils --
    static async toggleField<T extends GuildModuleName, F extends BooleanKeys<GuildModuleEntity<T>>>(guildId: string, moduleName: T, fieldName: F) {
        const module = await this.findOrCreate(guildId, moduleName);
        const payload = { [fieldName]: module[fieldName] } as any
        
        const repo = this.getRepo(moduleName); 
        await repo.update({ guildId } as FindOptionsWhere<GuildModuleEntity<T>>, payload);

        return { ...module, ...payload } as GuildModuleEntity<T>
    }

    static async resetModule<T extends GuildModuleName>(guildId: string, moduleName: T) {
        const key = `default${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`;

        const defaults = (GuildModules as any)[key];
        if (!defaults) {
            return await this.findByName(guildId, moduleName);
        }

        return await this.updateOrCreate(guildId, moduleName, { isEnabled: false, ...defaults });
    }
}