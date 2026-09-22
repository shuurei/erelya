import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1790111247214 implements MigrationInterface {
    name = 'Migration1790111247214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."guild_portal_type_enum" AS ENUM('green', 'yellow', 'blue', 'red')`);
        await queryRunner.query(`CREATE TABLE "guild_portal" ("id" SERIAL NOT NULL, "guildId" character varying NOT NULL, "type" "public"."guild_portal_type_enum" NOT NULL, "userId" character varying, "duration" integer NOT NULL, "xpReward" integer, "coinReward" integer, "startAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dab0aa685e95689583eaea2ac1e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_55cc97b6c0536e68cbfc886b6f" ON "guild_portal"  ("guildId", "userId") `);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "robSuccessChance"`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "robStealPercentage"`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "isRobEnabled"`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "robCooldown"`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "robbedCooldown"`);
        await queryRunner.query(`ALTER TABLE "guild" ADD "nextPortalGenerationAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "portalCompleted" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "isPortalEnabled" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "isPortalEnabled" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD CONSTRAINT "FK_316b7a848cd66b1630d62cf77be" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD CONSTRAINT "FK_f4af041e36718068b008f8d0fa1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP CONSTRAINT "FK_f4af041e36718068b008f8d0fa1"`);
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP CONSTRAINT "FK_316b7a848cd66b1630d62cf77be"`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "isPortalEnabled"`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "isPortalEnabled"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "portalCompleted"`);
        await queryRunner.query(`ALTER TABLE "guild" DROP COLUMN "nextPortalGenerationAt"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "robbedCooldown" integer NOT NULL DEFAULT '10800'`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "robCooldown" integer NOT NULL DEFAULT '3600'`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "isRobEnabled" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "robStealPercentage" real NOT NULL DEFAULT '0.2'`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "robSuccessChance" real NOT NULL DEFAULT '0.3'`);
        await queryRunner.query(`DROP INDEX "public"."IDX_55cc97b6c0536e68cbfc886b6f"`);
        await queryRunner.query(`DROP TABLE "guild_portal"`);
        await queryRunner.query(`DROP TYPE "public"."guild_portal_type_enum"`);
    }

}
