import type { MigrationInterface, QueryRunner } from 'typeorm'

// Frozen mapping for databases that already switched to static numeric IDs.
const legacyKeys = `
    NOTHING COMMON UNCOMMON GOOD RARE CRYSTALLIZED RAGE
    TOPAZ RUBY FORBIDDEN EMERALD INK SAPPHIRE AQUAMARINE
    PRECIOUS ATOMIC GLOCK OBLIVION MAGNETIC ASH PLAYER
    COLA SIDEREUM BLEEDING MEGAPHONE FLUSHED QUARTZ HONEY
    LOSTSOUL ATOMICRIBONEUCLEIC RAGEHEATED LEAK POWERED COPPER WATT
    SOLAR LUNAR FLUSHEDLOBOTOMY EXOTIC JADE SPECTRE JAZZ
    AETHER BOUNDED PUMP WATERMELON TERROR RAVEN PROWLER
    WARLOCK KYAWTHUITE ARCANE MAGNETICREVERSEPOLARITY RAGEBRAWLER UNBOUND SAVIOR
    HEADLESS AQUATICFLAME SOLARSOLSTICE LUNARFULLMOON ANIMA TWILIGHT ORIGIN
    HYPERVOLT VELOCITY NAUTILUSLOST HARNESSED HELIOS ARCANELEGACY CHROMATIC
    ARCANEDARK ETHEREAL JUXTAPOSITION OVERSEER EXOTICAPEX SENTINEL TWILIGHTIRIDESCENTMEMORY
    CARRIAGE HARNESSEDELEMENTS CHROMATICGENESIS OVERTURE SYMPHONY TWILIGHTWITHERINGGRACE HYPERVOLTEVERSTORM
    EXOTICVOID OVERTUREIHISTORY ORCHESTRA APOSTOLOS UNKNOWN KYAWTHUITEREMEMBRANCE ELUDE
    HARVESTER PROLOGUE SOVEREIGN AEGIS LAMENTHYR WIND FLOW
    STORMAL HURRICANE AVIATOR MAELSTROM TEMPESTCROWN ZEPHYRFREEDOM GLACIER
    PERMAFROST WONDERLAND BLIZZARD CHILLSEAR FROSTBITEETERNITY AURORAPRISM AQUATIC
    NAUTILUS POSEIDON SAILOR SAILORFLYINGDUTCHMAN MANTA ABYSSALHUNTER ABYSSTHALASSA
    TIDALLEVIATHAN GILDED JACKPOT NEFERKHAF ANUBIS ATLAS DUNEPHARAOH
    MIRAGESUNDIAL DIABOLI UNDEAD DIABOLIVOID UNDEADDEVIL HADES BLOODLUST
    EMBERCOVENANT INFERNALREGALIA HELLFIREABSOLUTION STARLIGHT STARRIDER ASTRAL STARGAZER
    STARSCOURGE SIRIUS STARSCOURGERADIANT ASTRALZODIAC STELLARREQUIEM COSMICAPOTHEOSIS DIVINUS
    DIVINUSANGEL CELESTIAL HOPE FAITH ZEUS CELESTIALDIVINE DIVINUSGUARDIAN
    ICARUS ARCHANGEL SERAPHJUDGEMENT DIVINITYASCENSION NATURAL FLORA RUNIC
    RUINS RUINSWITHERED VERDANTANCESTRY HAZARD CORROSIVE HAZARDRAYS PARASITE
    IMPEACHED CORRUPTIONBLACKTHRONE UNDEFINED SHIFTLOCK NIHILITY NULLABSOLUTE VOIDEPITAPH
    FAULT GLITCH FATALERROR OPPRESSION GLITCHPARADOX FATALRECURSION MEMORY
    ALICE LULLABY DREAMMETRIC DREAMSCAPE DREAMONEIROS VIRTUAL MATRIX
    VIRTUALWORLDWIDE MATRIXOVERDRIVE MATRIXREALITY PIXELATION CYBERNEONGOD COMET COSMOS
    GRAVITATIONAL GALAXY GARGANTUA EQUINOX SINGULARITYEVENTHORIZON ORBITALCOLLAPSE LOTUSFALL
    FLORAEVERGREEN SOPHYRA LUMINOSITY BLOOMELYSIUM RADIANCEINFINITY
`.trim().split(/\s+/);
const legacyPairs: ReadonlyArray<readonly [number, string]> = [
    ...legacyKeys.map((key, index) => [index + 1, key] as const),
    [1_000_001, 'DEVELOPER'], [1_000_002, 'FREND'], [1_000_003, 'RESCUE']
];

const specialKeys = ['DEVELOPER', 'FREND', 'RESCUE'];

export class AuraAndCoinflip1795396700751 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`LOCK TABLE "aura_player", "member_auras" IN ACCESS EXCLUSIVE MODE`);
        if (await queryRunner.hasColumn('member_auras', 'auraId')) {
            await this.convertAuraKeys(queryRunner);
        }

        if (!await queryRunner.hasColumn('member_auras', 'firstLuckPercent')) {
            await queryRunner.query(`ALTER TABLE "member_auras" ADD COLUMN "firstLuckPercent" integer`);
        }

        if (!await queryRunner.hasTable('user_auras')) {
            await queryRunner.query(`CREATE TABLE "user_auras" (
                "userId" varchar NOT NULL,
                "auraKey" varchar NOT NULL,
                "obtainedAt" timestamptz DEFAULT now(),
                PRIMARY KEY ("userId", "auraKey")
            )`);
            await queryRunner.query(`INSERT INTO "user_auras" ("userId", "auraKey", "obtainedAt")
                SELECT "userId", "auraKey", MIN("obtainedAt") FROM "member_auras"
                WHERE "auraKey" = ANY($1::varchar[]) AND "count" > 0
                GROUP BY "userId", "auraKey"`, [specialKeys]);
            await queryRunner.query(`DELETE FROM "member_auras" WHERE "auraKey" = ANY($1::varchar[])`, [specialKeys]);
        } else if (!await queryRunner.hasColumn('user_auras', 'obtainedAt')) {
            // Grants made before dates were tracked must keep an unknown date.
            await queryRunner.query(`ALTER TABLE "user_auras" ADD COLUMN "obtainedAt" timestamptz`);
            await queryRunner.query(`ALTER TABLE "user_auras" ALTER COLUMN "obtainedAt" SET DEFAULT now()`);
        }

        if (!await queryRunner.hasColumn('guild_member', 'coinflipRollsUsed')) {
            await queryRunner.query(`ALTER TABLE "guild_member"
                ADD COLUMN "coinflipHour" timestamptz,
                ADD COLUMN "coinflipRollsUsed" integer NOT NULL DEFAULT 0,
                ADD CONSTRAINT "guild_member_coinflip_rolls_used" CHECK ("coinflipRollsUsed" BETWEEN 0 AND 10)`);
        }
    }

    private async convertAuraKeys(queryRunner: QueryRunner): Promise<void> {
        const hasLegacyCatalogue = await queryRunner.hasTable('auras');
        if (hasLegacyCatalogue) await queryRunner.query(`LOCK TABLE "auras" IN ACCESS EXCLUSIVE MODE`);
        const referenced: { id: number; name?: string | null }[] = await queryRunner.query(`
            SELECT referenced.id ${hasLegacyCatalogue ? ', a.name' : ''}
            FROM (
                SELECT "auraId" AS id FROM "member_auras"
                UNION
                SELECT "equippedAuraId" FROM "aura_player" WHERE "equippedAuraId" IS NOT NULL
            ) AS referenced
            ${hasLegacyCatalogue ? 'LEFT JOIN "auras" a ON a.id = referenced.id' : ''}
        `);
        const knownKeys = new Set(legacyPairs.map(([, key]) => key));
        const keysById = new Map(legacyPairs);
        const used = new Set<string>();
        const cases = referenced.map(({ id, name }) => {
            const key = hasLegacyCatalogue ? name?.normalize('NFKD').toUpperCase().replace(/[^A-Z0-9]/g, '') : keysById.get(id);
            if (!Number.isSafeInteger(id) || !key || !knownKeys.has(key) || used.has(key)) {
                throw new Error(`Unmapped or ambiguous legacy aura: ${name ?? id}; migration aborted`);
            }
            used.add(key);
            return `WHEN ${id} THEN '${key}'`;
        }).join(' ');

        await queryRunner.query(`ALTER TABLE "member_auras" DROP CONSTRAINT IF EXISTS "FK_92a877211477449fb873f11737f"`);
        await queryRunner.query(`ALTER TABLE "aura_player" DROP CONSTRAINT IF EXISTS "FK_907aafae31cd46120b832fd2e6d"`);
        for (const [table, source, target] of [
            ['member_auras', 'auraId', 'auraKey'],
            ['aura_player', 'equippedAuraId', 'equippedAuraKey']
        ]) {
            const expression = cases ? `CASE "${source}" ${cases} END` : `"${source}"::varchar`;
            await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "${source}" TYPE varchar USING (${expression})`);
            await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN "${source}" TO "${target}"`);
        }
        await queryRunner.query(`DROP TABLE IF EXISTS "auras"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "aura_biomes"`);
    }

    async down(): Promise<void> {
        throw new Error('Restore a database backup to recover the old catalogue and server-specific grants');
    }
}

