import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1790151471384 implements MigrationInterface {
    name = 'Migration1790151471384'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "portalEntriesToday" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "lastPortalEntryAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "startAt"`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "startAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "guild_portal" DROP COLUMN "startAt"`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ADD "startAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "lastPortalEntryAt"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "portalEntriesToday"`);
    }

}
