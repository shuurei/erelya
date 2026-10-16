import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1792179455711 implements MigrationInterface {
    name = 'Migration1792179455711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "raffle_contributor" ("userId" character varying NOT NULL, "guildId" character varying NOT NULL, "coins" integer NOT NULL, "contributionWeek" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3e9ad0fdc0f9d1cb96e40b00533" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "raffle_contributor" ADD CONSTRAINT "FK_431fbc44f41390b25cb723e35f7" FOREIGN KEY ("userId", "guildId") REFERENCES "guild_member"("userId","guildId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "raffle_contributor" DROP CONSTRAINT "FK_431fbc44f41390b25cb723e35f7"`);
        await queryRunner.query(`DROP TABLE "raffle_contributor"`);
    }

}
