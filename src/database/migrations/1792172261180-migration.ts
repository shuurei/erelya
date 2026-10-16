import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1792172261180 implements MigrationInterface {
    name = 'Migration1792172261180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild_member" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild_member" DROP COLUMN "updatedAt"`);
    }

}
