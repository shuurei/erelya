import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1792958524168 implements MigrationInterface {
    name = 'Migration1792958524168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "level_module" ADD "isPrestigeEnabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "isPrestigeEnabled"`);
    }

}
