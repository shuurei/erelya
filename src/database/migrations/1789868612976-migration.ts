import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1789868612976 implements MigrationInterface {
    name = 'Migration1789868612976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "guildBoosterFactor"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "guildBoosterFactor" real NOT NULL DEFAULT '0.2'`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "tagSupporterFactor"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "tagSupporterFactor" real NOT NULL DEFAULT '0.2'`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "messageChance"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "messageChance" real NOT NULL DEFAULT '0.3'`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "callPrivatePenalty"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "callPrivatePenalty" real NOT NULL DEFAULT '0.25'`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "callMutedPenalty"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "callMutedPenalty" real NOT NULL DEFAULT '0.25'`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "callDeafPenalty"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "callDeafPenalty" real NOT NULL DEFAULT '0.35'`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "callCameraBonus"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "callCameraBonus" real NOT NULL DEFAULT '0.15'`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "callStreamBonus"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "callStreamBonus" real NOT NULL DEFAULT '0.15'`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "robSuccessChance"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "robSuccessChance" real NOT NULL DEFAULT '0.3'`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "robStealPercentage"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "robStealPercentage" real NOT NULL DEFAULT '0.2'`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "supporterPriceDiscount"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "supporterPriceDiscount" real NOT NULL DEFAULT '0.3'`);
        await queryRunner.query(`ALTER TABLE "event_module" DROP COLUMN "randomEventChance"`);
        await queryRunner.query(`ALTER TABLE "event_module" ADD "randomEventChance" real NOT NULL DEFAULT '0.05'`);
        await queryRunner.query(`ALTER TABLE "event_module" DROP COLUMN "guildCoinsChance"`);
        await queryRunner.query(`ALTER TABLE "event_module" ADD "guildCoinsChance" real NOT NULL DEFAULT '0.4'`);
        await queryRunner.query(`ALTER TABLE "event_module" DROP COLUMN "activityXpChance"`);
        await queryRunner.query(`ALTER TABLE "event_module" ADD "activityXpChance" real NOT NULL DEFAULT '0.6'`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "guildBoosterFactor"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "guildBoosterFactor" real NOT NULL DEFAULT '0.2'`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "tagSupporterFactor"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "tagSupporterFactor" real NOT NULL DEFAULT '0.2'`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "messageChance"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "messageChance" real NOT NULL DEFAULT '0.3'`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callGainIntervalMinutes"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callGainIntervalMinutes" real NOT NULL DEFAULT '15'`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callPrivatePenalty"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callPrivatePenalty" real NOT NULL DEFAULT '0.25'`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callMutedPenalty"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callMutedPenalty" real NOT NULL DEFAULT '0.25'`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callDeafPenalty"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callDeafPenalty" real NOT NULL DEFAULT '0.35'`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callCameraBonus"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callCameraBonus" real NOT NULL DEFAULT '0.15'`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callStreamBonus"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callStreamBonus" real NOT NULL DEFAULT '0.15'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callStreamBonus"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callStreamBonus" numeric NOT NULL DEFAULT 0.15`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callCameraBonus"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callCameraBonus" numeric NOT NULL DEFAULT 0.15`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callDeafPenalty"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callDeafPenalty" numeric NOT NULL DEFAULT 0.35`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callMutedPenalty"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callMutedPenalty" numeric NOT NULL DEFAULT 0.25`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callPrivatePenalty"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callPrivatePenalty" numeric NOT NULL DEFAULT 0.25`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "callGainIntervalMinutes"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "callGainIntervalMinutes" numeric NOT NULL DEFAULT '15'`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "messageChance"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "messageChance" numeric NOT NULL DEFAULT 0.3`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "tagSupporterFactor"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "tagSupporterFactor" numeric NOT NULL DEFAULT 0.2`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP COLUMN "guildBoosterFactor"`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD "guildBoosterFactor" numeric NOT NULL DEFAULT 0.2`);
        await queryRunner.query(`ALTER TABLE "event_module" DROP COLUMN "activityXpChance"`);
        await queryRunner.query(`ALTER TABLE "event_module" ADD "activityXpChance" numeric NOT NULL DEFAULT 0.6`);
        await queryRunner.query(`ALTER TABLE "event_module" DROP COLUMN "guildCoinsChance"`);
        await queryRunner.query(`ALTER TABLE "event_module" ADD "guildCoinsChance" numeric NOT NULL DEFAULT 0.4`);
        await queryRunner.query(`ALTER TABLE "event_module" DROP COLUMN "randomEventChance"`);
        await queryRunner.query(`ALTER TABLE "event_module" ADD "randomEventChance" numeric NOT NULL DEFAULT 0.05`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "supporterPriceDiscount"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "supporterPriceDiscount" numeric NOT NULL DEFAULT 0.3`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "robStealPercentage"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "robStealPercentage" numeric NOT NULL DEFAULT 0.2`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "robSuccessChance"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "robSuccessChance" numeric NOT NULL DEFAULT 0.3`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "callStreamBonus"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "callStreamBonus" numeric NOT NULL DEFAULT 0.15`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "callCameraBonus"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "callCameraBonus" numeric NOT NULL DEFAULT 0.15`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "callDeafPenalty"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "callDeafPenalty" numeric NOT NULL DEFAULT 0.35`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "callMutedPenalty"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "callMutedPenalty" numeric NOT NULL DEFAULT 0.25`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "callPrivatePenalty"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "callPrivatePenalty" numeric NOT NULL DEFAULT 0.25`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "messageChance"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "messageChance" numeric NOT NULL DEFAULT 0.3`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "tagSupporterFactor"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "tagSupporterFactor" numeric NOT NULL DEFAULT 0.2`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP COLUMN "guildBoosterFactor"`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD "guildBoosterFactor" numeric NOT NULL DEFAULT 0.2`);
    }

}
