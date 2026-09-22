import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1790112976653 implements MigrationInterface {
    name = 'Migration1790112976653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "portalCompleted"`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "redPortalCompleted" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "greenPortalCompleted" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "yellowPortalCompleted" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "bluePortalCompleted" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "bluePortalCompleted"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "yellowPortalCompleted"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "greenPortalCompleted"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "redPortalCompleted"`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "portalCompleted" integer NOT NULL DEFAULT '0'`);
    }

}
