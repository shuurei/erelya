import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1792171515523 implements MigrationInterface {
    name = 'Migration1792171515523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "flags"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "redPortalCompleted"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "greenPortalCompleted"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "yellowPortalCompleted"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "bluePortalCompleted"`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "coinflipWon" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "coinflipLost" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TYPE "public"."guild_portal_type_enum" ADD VALUE 'black'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."guild_portal_type_enum_old" AS ENUM('green', 'yellow', 'blue', 'red')`);
        await queryRunner.query(`ALTER TABLE "guild_portal" ALTER COLUMN "type" TYPE "public"."guild_portal_type_enum_old" USING "type"::"text"::"public"."guild_portal_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."guild_portal_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."guild_portal_type_enum_old" RENAME TO "guild_portal_type_enum"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "coinflipLost"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "coinflipWon"`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "bluePortalCompleted" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "yellowPortalCompleted" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "greenPortalCompleted" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "redPortalCompleted" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "flags" integer NOT NULL DEFAULT '0'`);
    }

}
