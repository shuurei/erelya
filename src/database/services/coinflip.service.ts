import { randomInt } from 'node:crypto'
import { db } from '../db'
import { AuraPlayer } from '../entities/aura-player.entity'
import { GuildMember } from '../entities/guild-member.entity'
import { auraHour } from '@/utils/aura-hour'
import { getAuraEffect } from '@/data/aura-effects'

export const COINFLIP_HOURLY_LIMIT = 10;
export const MIN_COINFLIP_BET = 100;
const MAX_BET = 1_000_000;
const MAX_BALANCE = 2_147_483_647;

const parseBet = (input: string, coins: number, maxBet: number): number | null => {
    const value = input.trim().toLowerCase();
    if (value === 'max') return Math.min(coins, maxBet);

    const match = value.match(/^(\d+(?:[.,]\d+)?)%$/);
    if (match) {
        const percentage = Number(match[1].replace(',', '.'));
        if (percentage <= 0 || percentage > 100) return null;
        
        return Math.min(Math.floor(coins * percentage / 100), maxBet);
    }

    const amount = Number(value);
    return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
};

export class CoinflipService {
    static async play(guildId: string, userId: string, input: string) {
        return db.transaction(async manager => {
            const repo = manager.getRepository(GuildMember);
            const where = { guildId, userId };

            const member = await repo.findOne({ where, lock: { mode: 'pessimistic_write' } });
            const hour = auraHour();
            const used = member?.coinflipHour?.getTime() === hour.startedAt ? member.coinflipRollsUsed : 0;
            if (used >= COINFLIP_HOURLY_LIMIT) {
                return { error: 'quota' } as const;
            }

            const player = await manager.getRepository(AuraPlayer).findOneBy(where);
            const maxBet = getAuraEffect(player?.equippedAuraKey)?.coinflipMaxBet ?? MAX_BET;
            const amount = parseBet(input, member?.coins ?? 0, maxBet);
            
            if (amount === null) {
                return { error: 'invalid' } as const;
            }
            
            if (amount < MIN_COINFLIP_BET) {
                return { error: 'minimum' } as const;
            }
            
            if (amount > maxBet) {
                return { error: 'maximum', maxBet } as const;
            }
            
            if (!member || member.coins < amount) {
                return { error: 'funds' } as const;
            }

            if (member.coins + amount > MAX_BALANCE) {
                return { error: 'balance' } as const;
            }

            const win = randomInt(2) === 0;
            const balance = member.coins + (win ? amount : -amount);
            await repo.update(where, {
                coins: balance,
                coinflipHour: new Date(hour.startedAt),
                coinflipRollsUsed: used + 1,
                ...(win ? { coinflipWon: member.coinflipWon + 1 } : { coinflipLost: member.coinflipLost + 1 })
            });

            return { win, amount, balance, remaining: COINFLIP_HOURLY_LIMIT - used - 1 } as const;
        });
    }
}
