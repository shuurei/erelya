import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1790199815801 implements MigrationInterface {
    name = 'Migration1790199815801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "guild_member_item" ("guildId" character varying NOT NULL, "userId" character varying NOT NULL, "itemId" character varying NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "data" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_d27e309a9b5df33ee878aeb5590" PRIMARY KEY ("guildId", "userId", "itemId"))`);
        await queryRunner.query(`ALTER TABLE "guild_member_item" ADD CONSTRAINT "FK_b56fed76a6f7f5f4fbb8b0c79a6" FOREIGN KEY ("userId", "guildId") REFERENCES "guild_member"("userId","guildId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "guild_member_item" DROP CONSTRAINT "FK_b56fed76a6f7f5f4fbb8b0c79a6"`);
        await queryRunner.query(`DROP TABLE "guild_member_item"`);
    }

}
