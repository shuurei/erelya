import { db } from '../db'
import { MemberAura } from '../entities/member-aura.entity'
import { AuraPlayer } from '../entities/aura-player.entity'
import { UserAura } from '../entities/user-aura.entity'
import { AURA_ROLL_LIMIT, LUCK_POTIONS, LuckPotion, activeLuckPotion, auraLuckPercent, isAuraBonusRoll, selectAura } from '@/utils/aura'
import { GuildMember } from '../entities/guild-member.entity'
import { EntityManager, MoreThanOrEqual } from 'typeorm'
import { potionWeekStart, potionMonth } from '@/utils/aura-biome'
import { AuraBiomeService } from './aura-biome.service'
import { auraHour } from '@/utils/aura-hour'
import { AURA_GLOVES, gloveLuckBonusPercent } from '@/utils/aura-gloves'
import { AURAS, AURAS_BY_KEY, AURAS_BY_NAME, ROLLABLE_AURAS } from '@/data/auras'
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
                luck: config.storedLuck, luckRollsRemaining: config.rolls,
                ...(potion === 'godly' ? { potionWeekStartedAt: week, godlyPurchases: purchases + 1 } : {}),
                ...(potion === 'monthly' ? { potionMonthStartedAt: month.startedAt, monthlyPurchases: monthlyPurchases + 1 } : {})
            });
            
            return {
                bonusPercent: config.bonusPercent,
                rollsRemaining: config.rolls
            } as const;
        });
    }

    static async luckStatus(guildId: string, userId: string) {
        const player = await db.getRepository(AuraPlayer).findOneBy({ guildId, userId });
        const potion = player ? activeLuckPotion(player.luck, player.luckRollsRemaining) : undefined;

        const week = potionWeekStart();
        const used = player?.potionWeekStartedAt?.getTime() === week.getTime() ? player.godlyPurchases : 0;

        const month = potionMonth();
        const monthlyUsed = player?.potionMonthStartedAt?.getTime() === month.startedAt.getTime() ? player.monthlyPurchases : 0;

        const gloveBonusPercent = gloveLuckBonusPercent(player?.gloveLevel ?? 0);
        return {
            luckPercent: auraLuckPercent(gloveBonusPercent, potion),
            gloveBonusPercent,
            equippedAura: player?.equippedAuraKey ? AURAS_BY_KEY.get(player.equippedAuraKey) : undefined,
            rollsRemaining: potion ? player?.luckRollsRemaining ?? 0 : 0,
            potionBonusPercent: potion?.bonusPercent ?? 0,
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

            const bonusRoll = isAuraBonusRoll(rollsUsed);
            const potion = activeLuckPotion(player.luck, player.luckRollsRemaining);
            const luckPercent = auraLuckPercent(gloveLuckBonusPercent(player.gloveLevel), potion, bonusRoll);
            const biome = AuraBiomeService.current(hour);
            const getBiomeBoost = (aura: (typeof ROLLABLE_AURAS)[number]) => aura.biome === biome.name ? biome.multiplier : 1;
            const aura = selectAura(ROLLABLE_AURAS, luckPercent, getBiomeBoost);
            const biomeBoost = getBiomeBoost(aura);

            const inventory = manager.getRepository(MemberAura);
            const owned = await inventory.findOneBy({ guildId, userId, auraKey: aura.key });
            if (owned) {
                await inventory.increment({ guildId, userId, auraKey: aura.key }, 'count', 1);
            } else {
                await inventory.insert({ guildId, userId, auraKey: aura.key, count: 1, firstLuckPercent: luckPercent * biomeBoost });
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
                luckPercent,
                bonusRoll,
                biome,
                biomeBoost,
                luckRollsRemaining,
                isNew: !owned,
                availableAt,
                remaining: AURA_ROLL_LIMIT - rollsUsed - 1
            } as const;
        });
    }

    static async collection(guildId: string, userId: string, requestedPage = 1, sort: AuraCollectionSort = 'normal', unlockedOnly = false) {
        const [inventory, specialInventory] = await Promise.all([
            db.getRepository(MemberAura).findBy({ guildId, userId }),
            db.getRepository(UserAura).findBy({ userId })
        ]);
        
        const owned = new Map<string, {
            count: number;
            obtainedAt: Date | null;
            firstLuckPercent: number | null
        }>(inventory.map(({ auraKey, count, obtainedAt, firstLuckPercent }) => [auraKey, { count, obtainedAt, firstLuckPercent }]));
        
        for (const { auraKey, obtainedAt } of specialInventory) {
            owned.set(auraKey, { count: 1, obtainedAt, firstLuckPercent: null });
        }

        const visible = AURAS.filter(aura => !unlockedOnly || owned.has(aura.key));
        const sorted = visible.sort((a, b) => {
            if (a.chance === null || b.chance === null) {
                return a.chance === b.chance ? a.key.localeCompare(b.key) : a.chance === null ? 1 : -1;
            }

            const first = a.chance;
            const second = b.chance;
            const order = first < second ? -1 : first > second ? 1 : 0;
            
            return (sort === 'rarest' ? -order : order) || a.key.localeCompare(b.key);
        });

        const pages = Math.max(1, Math.ceil(sorted.length / 5));
        const page = Math.min(pages, Math.max(1, Number.isSafeInteger(requestedPage) ? requestedPage : 1));
        
        return {
            auras: sorted.slice((page - 1) * 5, page * 5), owned, total: AURAS.length, page, pages
        };
    }

    static async grant(guildId: string, userId: string, key: string) {
        const aura = AURAS_BY_KEY.get(key);
        if (!aura) {
            return { error: 'unknown' } as const;
        }

        return db.transaction(async manager => {
            if (aura.chance === null) {
                const result = await manager.createQueryBuilder()
                    .insert()
                    .into(UserAura)
                    .values({ userId, auraKey: aura.key })
                    .orIgnore()
                    .returning(['auraKey'])
                    .execute();

                return result.raw.length ? { aura } as const : { error: 'owned' } as const;
            }

            await this.lockPlayer(manager, guildId, userId);
            const inventory = manager.getRepository(MemberAura);
            const slot = { guildId, userId, auraKey: aura.key };
            const owned = await inventory.findOneBy(slot);

            if (owned) {
                await inventory.increment(slot, 'count', 1);
            } else {
                await inventory.insert({ ...slot, count: 1 });
            }

            return { aura } as const;
        });
    }

    static async remove(guildId: string, userId: string, auraKey: string) {
        const aura = AURAS_BY_KEY.get(auraKey);
        if (!aura) return null;

        return db.transaction(async manager => {
            if (aura.chance === null) {
                const result = await manager.getRepository(UserAura).delete({ userId, auraKey });
                if (!result.affected) return null;
                await manager.getRepository(AuraPlayer).update({ userId, equippedAuraKey: auraKey }, { equippedAuraKey: null });
                return aura;
            }

            const player = await this.lockPlayer(manager, guildId, userId);
            const result = await manager.getRepository(MemberAura).delete({ guildId, userId, auraKey });
            if (!result.affected) return null;

            if (player.equippedAuraKey === auraKey) {
                await manager.getRepository(AuraPlayer).update({ guildId, userId }, { equippedAuraKey: null });
            }
            
            return aura;
        });
    }

    static async equip(guildId: string, userId: string, auraKey: string) {
        const aura = AURAS_BY_KEY.get(auraKey);
        if (!aura) return null;

        return db.transaction(async (manager) => {
            if (aura.chance === null) {
                const owned = await manager.getRepository(UserAura).findOne({
                    where: { userId, auraKey },
                    lock: { mode: 'pessimistic_write' }
                });

                if (!owned) return null;
            }
            
            await this.lockPlayer(manager, guildId, userId);
            if (aura.chance !== null && !await manager.getRepository(MemberAura).existsBy({ guildId, userId, auraKey, count: MoreThanOrEqual(1) })) {
                return null;
            }
          
            await manager.getRepository(AuraPlayer).update({ guildId, userId }, { equippedAuraKey: aura.key });
          
            return aura;
        });
    }

    static async gloves(guildId: string, userId: string) {
        const player = await db.getRepository(AuraPlayer).findOneBy({ guildId, userId });
        const owned = await db.getRepository(MemberAura).findBy({ guildId, userId });

        return {
            level: player?.gloveLevel ?? 0,
            counts: new Map<string, number>(owned.flatMap(entry => {
                const aura = AURAS_BY_KEY.get(entry.auraKey);
                return aura ? [[aura.name, entry.count] as const] : [];
            }))
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
            
            for (const [auraName, amount] of Object.entries(glove.recipe)) {
                const aura = AURAS_BY_NAME.get(auraName);
                if (!aura || aura.chance === null) {
                    return { error: 'ingredients' } as const;
                }

                const entry = await manager.getRepository(MemberAura).findOneBy({ guildId, userId, auraKey: aura.key });
                if (!entry || entry.count < amount) {
                    return { error: 'ingredients' } as const;
                }
                
                ingredients.push({ entry, amount });
            }
            
            for (const { entry, amount } of ingredients) {
                await manager.getRepository(MemberAura).decrement({ guildId, userId, auraKey: entry.auraKey }, 'count', amount);
                if (entry.auraKey === player.equippedAuraKey && entry.count === amount) {
                    await manager.getRepository(AuraPlayer).update({ guildId, userId }, { equippedAuraKey: null });
                }
            }

            await manager.getRepository(AuraPlayer).update({ guildId, userId }, { gloveLevel: tier + 1 });
            
            return { glove } as const;
        });
    }

    static async unequip(guildId: string, userId: string) {
        await db.getRepository(AuraPlayer).update({ guildId, userId }, { equippedAuraKey: null });
    }

    static async equipped(guildId: string, userId: string) {
        const player = await db.getRepository(AuraPlayer).findOneBy({ guildId, userId });
        return player?.equippedAuraKey == null ? null : AURAS_BY_KEY.get(player.equippedAuraKey) ?? null;
    }
}
