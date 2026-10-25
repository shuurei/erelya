import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1792934765777 implements MigrationInterface {
    name = 'Migration1792934765777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "coinReward"`);
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "xpReward"`);
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."guild_portal_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."guild_portal_rank_enum" AS ENUM('N', 'S', 'A', 'B', 'C', 'D', 'E')`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "rank" "public"."guild_portal_rank_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "hasCoinReward" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "hasXpReward" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "isStatsHidden" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "isStatsHidden"`);
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "hasXpReward"`);
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "hasCoinReward"`);
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "rank"`);
        await queryRunner.query(`DROP TYPE "public"."guild_portal_rank_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."guild_portal_type_enum" AS ENUM('green', 'yellow', 'blue', 'red', 'black')`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "type" "public"."guild_portal_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "xpReward" integer`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "coinReward" integer`);
    }

}
