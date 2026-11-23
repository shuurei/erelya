import { db } from '../db'
import { Aura } from '../entities/aura.entity'
import { MemberAura } from '../entities/member-aura.entity'
import { AuraPlayer } from '../entities/aura-player.entity'
import { AURA_ROLL_LIMIT, AURA_ROLL_PRICE, LUCK_POTIONS, LuckPotion, selectAura } from '@/utils/aura'
import { GuildMember } from '../entities/guild-member.entity'
import { EntityManager, MoreThanOrEqual, In } from 'typeorm'
import { potionWeekStart, potionMonth } from '@/utils/aura-biome'
import { AuraBiomeService } from './aura-biome.service'
import { auraHour } from '@/utils/aura-hour'
import { AURA_GLOVES, gloveLuck } from '@/utils/aura-gloves'
export type AuraCollectionSort = 'normal' | 'rarest'

export class AuraService {
    private static async lockPlayer(manager: EntityManager, guildId: string, userId: string) {
        await manager.createQueryBuilder()
            .insert()
            .into(AuraPlayer)
            .values({ guildId, userId })
            .orIgnore()
            .execute();

        return manager.getRepository(AuraPlayer).findOneOrFail({
            where: { guildId, userId }, lock: { mode: 'pessimistic_write' }
        });
    }

    private static async charge(manager: EntityManager, guildId: string, userId: string, price: number) {
        const result = await manager.getRepository(GuildMember).decrement({
            guildId,
            userId,
            coins: MoreThanOrEqual(price)
        }, 'coins', price);

        return result.affected === 1;
    }

    static async drink(guildId: string, userId: string, potion: LuckPotion) {
        const config = LUCK_POTIONS[potion];

        return db.transaction(async (manager) => {
            const player = await this.lockPlayer(manager, guildId, userId);
            if (player.luckRollsRemaining > 0) {
                return { error: 'active' } as const;
            }

            const week = potionWeekStart();
            const purchases = player.potionWeekStartedAt?.getTime() === week.getTime() ? player.godlyPurchases : 0;
            if (potion === 'godly' && purchases >= 5) {
                return { error: 'weekly' } as const;
            }

            const month = potionMonth();
            const monthlyPurchases = player.potionMonthStartedAt?.getTime() === month.startedAt.getTime() ? player.monthlyPurchases : 0;
            if (potion === 'monthly' && monthlyPurchases >= 3) {
                return { error: 'monthly' } as const;
            }

            if (!await this.charge(manager, guildId, userId, config.price)) {
                return { error: 'funds' } as const;
            }
            
            await manager.getRepository(AuraPlayer).update({ guildId, userId }, {
                luck: config.luck, luckRollsRemaining: config.rolls,
                ...(potion === 'godly' ? { potionWeekStartedAt: week, godlyPurchases: purchases + 1 } : {}),
                ...(potion === 'monthly' ? { potionMonthStartedAt: month.startedAt, monthlyPurchases: monthlyPurchases + 1 } : {})
            });
            
            return {
                luck: config.luck,
                rollsRemaining: config.rolls
            } as const;
        });
    }

    static async luckStatus(guildId: string, userId: string) {
        const player = await db.getRepository(AuraPlayer).findOneBy({ guildId, userId });
        const active = player && player.luckRollsRemaining > 0;

        const week = potionWeekStart();
        const used = player?.potionWeekStartedAt?.getTime() === week.getTime() ? player.godlyPurchases : 0;

        const month = potionMonth();
        const monthlyUsed = player?.potionMonthStartedAt?.getTime() === month.startedAt.getTime() ? player.monthlyPurchases : 0;

        return {
            luck: (active ? player.luck : 1) * gloveLuck(player?.gloveLevel ?? 0),
            permanentLuck: gloveLuck(player?.gloveLevel ?? 0),
            rollsRemaining: active ? player.luckRollsRemaining : 0,
            potionLuck: (used ? LUCK_POTIONS['monthly'].luck : 0) + (monthlyUsed ? LUCK_POTIONS['monthly'].luck : 0),
            godlyRemaining: 5 - used,
            resetsAt: week.getTime() + 7 * 86_400_000,
            monthlyRemaining: 3 - monthlyUsed,
            monthlyResetsAt: month.resetsAt
        };
    }

    static async roll(guildId: string, userId: string) {
        return db.transaction(async (manager) => {
            const player = await this.lockPlayer(manager, guildId, userId);
            const hour = auraHour();
            const rollHour = new Date(hour.startedAt);

            const rollsUsed = player.rollHour && auraHour(player.rollHour.getTime()).startedAt === hour.startedAt
                ? player.rollsUsed
                : 0;
                
            const availableAt = hour.changesAt;
            if (rollsUsed >= AURA_ROLL_LIMIT) {
                return { error: 'quota', availableAt, remaining: 0 } as const;
            }

            const auras = await manager.getRepository(Aura).find({ relations: { biome: true }, order: { id: 'ASC' } });
            const luck = (player.luckRollsRemaining > 0 ? player.luck : 1) * gloveLuck(player.gloveLevel);
            const biome = await AuraBiomeService.current(manager);
            const aura = selectAura(auras, luck, aura => aura.biomeId === biome.id ? biome.multiplier : 1);
            if (!await this.charge(manager, guildId, userId, AURA_ROLL_PRICE)) {
                return { error: 'funds', availableAt, remaining: AURA_ROLL_LIMIT - rollsUsed } as const;
            }

            const inventory = manager.getRepository(MemberAura);
            const owned = await inventory.findOneBy({ guildId, userId, auraId: aura.id });
            if (owned) {
                await inventory.increment({ guildId, userId, auraId: aura.id }, 'count', 1);
            } else {
                await inventory.insert({ guildId, userId, auraId: aura.id, count: 1 });
            }
            
            const count = (owned?.count ?? 0) + 1;
            const luckRollsRemaining = Math.max(0, player.luckRollsRemaining - 1);
            
            await manager.getRepository(AuraPlayer).update({ guildId, userId }, {
                rollHour, rollsUsed: rollsUsed + 1, luckRollsRemaining,
                luck: luckRollsRemaining > 0 ? player.luck : 1
            });
            
            return {
                aura,
                count,
                luck,
                biome,
                biomeBoost: aura.biomeId === biome.id ? biome.multiplier : 1,
                luckRollsRemaining,
                isNew: !owned,
                availableAt,
                remaining: AURA_ROLL_LIMIT - rollsUsed - 1
            } as const;
        });
    }

    static async collection(guildId: string, userId: string, requestedPage = 1, sort: AuraCollectionSort = 'normal', unlockedOnly = false) {
        return db.transaction('REPEATABLE READ', async (manager) => {
            const repo = manager.getRepository(Aura);
            
            const total = await repo.count();
            const owned = await manager.getRepository(MemberAura).findBy({ guildId, userId });

            const where = unlockedOnly ? { id: In(owned.map(entry => entry.auraId)) } : {};
            const filteredTotal = unlockedOnly ? owned.length : total;
            const pages = Math.max(1, Math.ceil(filteredTotal / 5));
            const page = Math.min(pages, Math.max(1, Number.isSafeInteger(requestedPage) ? requestedPage : 1));
            const auras = await repo.find({
                where,
                relations: { biome: true },
                order: { chance: sort === 'rarest' ? 'DESC' : 'ASC', id: 'ASC' },
                skip: (page - 1) * 5,
                take: 5
            });
            
            return {
                auras,
                owned: new Map(owned.map((entry) => [entry.auraId, entry.count])),
                total,
                page,
                pages
            };
        });
    }

    static async equip(guildId: string, userId: string, auraId: number) {
        return db.transaction(async (manager) => {
            await this.lockPlayer(manager, guildId, userId);
            if (!Number.isSafeInteger(auraId) || auraId < 1 || auraId > 2147483647) {
                return null;
            }
          
            const aura = await manager.getRepository(Aura).findOneBy({ id: auraId });
            if (!aura || !await manager.getRepository(MemberAura).existsBy({ guildId, userId, auraId: aura.id, count: MoreThanOrEqual(1) })) {
                return null;
            }
          
            await manager.getRepository(AuraPlayer).update({ guildId, userId }, { equippedAuraId: aura.id });
          
            return aura;
        });
    }

    static async gloves(guildId: string, userId: string) {
        const player = await db.getRepository(AuraPlayer).findOneBy({ guildId, userId });
        const owned = await db.getRepository(MemberAura).find({ where: { guildId, userId }, relations: { aura: true } });

        return {
            level: player?.gloveLevel ?? 0,
            counts: new Map(owned.map((entry) => [entry.aura.name, entry.count]))
        };
    }

    static async craftGlove(guildId: string, userId: string, key: string) {
        return db.transaction(async (manager) => {
            const player = await this.lockPlayer(manager, guildId, userId);
            const tier = AURA_GLOVES.findIndex(glove => glove.key === key);
            
            if (tier < 0) {
                return { error: 'unknown' } as const;
            }
            
            if (tier !== player.gloveLevel) {
                return { error: 'tier' } as const;
            }
            
            const glove = AURA_GLOVES[tier];
            const ingredients = [];
            
            for (const [name, amount] of Object.entries(glove.recipe)) {
                const aura = await manager.getRepository(Aura).findOneBy({ name });
                const entry = aura && await manager.getRepository(MemberAura).findOneBy({ guildId, userId, auraId: aura.id });
                
                if (!entry || entry.count < amount) {
                    return { error: 'ingredients' } as const;
                }
                
                ingredients.push({ entry, amount });
            }
            
            for (const { entry, amount } of ingredients) {
                await manager.getRepository(MemberAura).decrement({ guildId, userId, auraId: entry.auraId }, 'count', amount);
                if (entry.auraId === player.equippedAuraId && entry.count === amount) {
                    await manager.getRepository(AuraPlayer).update({ guildId, userId }, { equippedAuraId: null });
                }
            }

            await manager.getRepository(AuraPlayer).update({ guildId, userId }, { gloveLevel: tier + 1 });
            
            return { glove } as const;
        });
    }

    static async unequip(guildId: string, userId: string) {
        await db.getRepository(AuraPlayer).update({ guildId, userId }, { equippedAuraId: null });
    }

    static async equipped(guildId: string, userId: string) {
        const player = await db.getRepository(AuraPlayer).findOne({
            where: { guildId, userId },
            relations: { equippedAura: true }
        });

        return player?.equippedAura ?? null;
    }
}
