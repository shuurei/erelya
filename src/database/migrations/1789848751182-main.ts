import { MigrationInterface, QueryRunner } from "typeorm";

export class Main1789848751182 implements MigrationInterface {
    name = 'Main1789848751182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "guild" ("id" character varying NOT NULL, "welcomeChannelId" character varying, "supportRoleId" character varying, "messageDeletedAuditChannelId" character varying, "messageEditedAuditChannelId" character varying, "lastEventAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cfbbd0a2805cab7053b516068a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "channel_blacklist" ("guildId" character varying NOT NULL, "channelId" character varying NOT NULL, "scope" "public"."channel_blacklist_scope_enum" NOT NULL, CONSTRAINT "PK_f3df5ef88f013ae4494a06f333b" PRIMARY KEY ("guildId", "channelId", "scope"))`);
        await queryRunner.query(`CREATE TABLE "guild_level_reward" ("guildId" character varying NOT NULL, "atLevel" character varying NOT NULL, "coinsReward" integer, "roleId" character varying(255), "isStackable" boolean, CONSTRAINT "PK_c6a4da66ef97ae6915af53edf9c" PRIMARY KEY ("guildId", "atLevel"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" character varying NOT NULL, "flags" integer NOT NULL DEFAULT '0', "tagAssignedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "guild_member" ("userId" character varying NOT NULL, "guildId" character varying NOT NULL, "xp" integer NOT NULL DEFAULT '0', "coins" integer NOT NULL DEFAULT '0', "messageCount" integer NOT NULL DEFAULT '0', "callPrivateMinutes" integer NOT NULL DEFAULT '0', "callPublicMinutes" integer NOT NULL DEFAULT '0', "callActiveMinutes" integer NOT NULL DEFAULT '0', "callDeafMinutes" integer NOT NULL DEFAULT '0', "callMutedMinutes" integer NOT NULL DEFAULT '0', "callStreamingMinutes" integer NOT NULL DEFAULT '0', "callCameraMinutes" integer NOT NULL DEFAULT '0', "dailyStreak" integer NOT NULL DEFAULT '0', "lastAttendedAt" TIMESTAMP, "lastWorkedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_59e0756d90604968396baa9bbb5" PRIMARY KEY ("userId", "guildId"))`);
        await queryRunner.query(`CREATE TABLE "guild_member_daily_quest" ("userId" character varying NOT NULL, "guildId" character varying NOT NULL, "type" "public"."guild_member_daily_quest_type_enum" NOT NULL, "target" integer NOT NULL, "progress" integer NOT NULL DEFAULT '0', "startAt" TIMESTAMP NOT NULL, "isClaimed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_ebbe2fb7e4672d0d15088921a07" PRIMARY KEY ("userId", "guildId"))`);
        await queryRunner.query(`CREATE TABLE "economy_module" ("guildId" character varying NOT NULL, "isEnabled" boolean NOT NULL DEFAULT false, "guildBoosterFactor" numeric NOT NULL DEFAULT '0.2', "tagSupporterFactor" numeric NOT NULL DEFAULT '0.2', "isGuildCoinsFromMessageEnabled" boolean NOT NULL DEFAULT true, "messageChance" numeric NOT NULL DEFAULT '0.3', "messageMinGain" integer NOT NULL DEFAULT '8', "messageMaxGain" integer NOT NULL DEFAULT '24', "isGuildCoinsFromCallEnabled" boolean NOT NULL DEFAULT true, "callPrivatePenalty" numeric NOT NULL DEFAULT '0.25', "callMutedPenalty" numeric NOT NULL DEFAULT '0.25', "callDeafPenalty" numeric NOT NULL DEFAULT '0.35', "callCameraBonus" numeric NOT NULL DEFAULT '0.15', "callStreamBonus" numeric NOT NULL DEFAULT '0.15', "callGainIntervalMinutes" integer NOT NULL DEFAULT '15', "callMinGain" integer NOT NULL DEFAULT '24', "callMaxGain" integer NOT NULL DEFAULT '40', "isWorkEnabled" boolean NOT NULL DEFAULT true, "workCooldown" integer NOT NULL DEFAULT '60', "workMinGain" integer NOT NULL DEFAULT '200', "workMaxGain" integer NOT NULL DEFAULT '500', "isRobEnabled" boolean NOT NULL DEFAULT true, "robSuccessChance" numeric NOT NULL DEFAULT '0.3', "robStealPercentage" numeric NOT NULL DEFAULT '0.2', "robCooldown" integer NOT NULL DEFAULT '3600', "robbedCooldown" integer NOT NULL DEFAULT '10800', "isShopEnabled" boolean NOT NULL DEFAULT false, "isGamblingEnabled" boolean NOT NULL DEFAULT false, "supporterPriceDiscount" numeric NOT NULL DEFAULT '0.3', CONSTRAINT "PK_9ff55fd4b5fcc16f79eab2f8eb3" PRIMARY KEY ("guildId"))`);
        await queryRunner.query(`CREATE TABLE "event_module" ("guildId" character varying NOT NULL, "isEnabled" boolean NOT NULL DEFAULT false, "randomEventCooldown" integer NOT NULL DEFAULT '180', "randomEventChance" numeric NOT NULL DEFAULT '0.05', "isGuildCoinEventEnabled" boolean NOT NULL DEFAULT true, "guildCoinsChance" numeric NOT NULL DEFAULT '0.4', "guildCoinsMinGain" integer NOT NULL DEFAULT '1000', "guildCoinsMaxGain" integer NOT NULL DEFAULT '2000', "isActivityXpEventEnabled" boolean NOT NULL DEFAULT true, "activityXpChance" numeric NOT NULL DEFAULT '0.6', "activityXpMinGain" integer NOT NULL DEFAULT '500', "activityXpMaxGain" integer NOT NULL DEFAULT '800', CONSTRAINT "PK_05b6b326300a4ff012fc8d72d09" PRIMARY KEY ("guildId"))`);
        await queryRunner.query(`CREATE TABLE "level_module" ("guildId" character varying NOT NULL, "isEnabled" boolean NOT NULL DEFAULT false, "guildBoosterFactor" numeric NOT NULL DEFAULT '0.2', "tagSupporterFactor" numeric NOT NULL DEFAULT '0.2', "isXpFromMessageEnabled" boolean NOT NULL DEFAULT true, "messageChance" numeric NOT NULL DEFAULT '0.3', "isXpFromCallEnabled" boolean NOT NULL DEFAULT true, "callGainIntervalMinutes" numeric NOT NULL DEFAULT '15', "callPrivatePenalty" numeric NOT NULL DEFAULT '0.25', "callMutedPenalty" numeric NOT NULL DEFAULT '0.25', "callDeafPenalty" numeric NOT NULL DEFAULT '0.35', "callCameraBonus" numeric NOT NULL DEFAULT '0.15', "callStreamBonus" numeric NOT NULL DEFAULT '0.15', "maxLevel" integer NOT NULL DEFAULT '100', CONSTRAINT "PK_3aa68916c71ff79d210e37b4b80" PRIMARY KEY ("guildId"))`);
        await queryRunner.query(`CREATE TABLE "quest_module" ("guildId" character varying NOT NULL, "isEnabled" boolean NOT NULL DEFAULT false, "isMessageQuestEnabled" boolean NOT NULL DEFAULT true, "isVoiceQuestEnabeld" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_395f0009d203413371a6bf0d8af" PRIMARY KEY ("guildId"))`);
        await queryRunner.query(`CREATE TABLE "shop" ("guildId" character varying NOT NULL, "name" character varying NOT NULL, "isOpen" boolean NOT NULL DEFAULT true, "useTagDiscount" boolean NOT NULL DEFAULT false, "color" integer, "description" text, "emoji" character varying(32), "bannerUrl" text, "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e7f6af9f12d48ab56470f96d217" PRIMARY KEY ("guildId", "name"))`);
        await queryRunner.query(`CREATE TABLE "shop_item" ("guildId" character varying NOT NULL, "roleId" character varying NOT NULL, "shopName" character varying NOT NULL, "description" text, "cost" integer NOT NULL, "stock" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_46204f96d0c3d8755681a678840" PRIMARY KEY ("guildId", "roleId"))`);
        await queryRunner.query(`ALTER TABLE "channel_blacklist" ADD CONSTRAINT "FK_3ea720478d5e62581d749570cf3" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guild_level_reward" ADD CONSTRAINT "FK_c40547f30f01dcfef6bff5823a7" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD CONSTRAINT "FK_079c272d9c6d2ccc45240ff246f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guild_member" ADD CONSTRAINT "FK_c6adfed3d6a7330d91a4f21ce1d" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "guild_member_daily_quest" ADD CONSTRAINT "FK_ebbe2fb7e4672d0d15088921a07" FOREIGN KEY ("userId", "guildId") REFERENCES "guild_member"("userId","guildId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "economy_module" ADD CONSTRAINT "FK_9ff55fd4b5fcc16f79eab2f8eb3" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_module" ADD CONSTRAINT "FK_05b6b326300a4ff012fc8d72d09" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "level_module" ADD CONSTRAINT "FK_3aa68916c71ff79d210e37b4b80" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quest_module" ADD CONSTRAINT "FK_395f0009d203413371a6bf0d8af" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop" ADD CONSTRAINT "FK_5b9be44cd82b487a2182b515d17" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop_item" ADD CONSTRAINT "FK_3939c7a5081032b77d218546710" FOREIGN KEY ("guildId", "shopName") REFERENCES "shop"("guildId","name") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop_item" ADD CONSTRAINT "FK_cae8b67f051b2496bedfa3f29d3" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop_item" DROP CONSTRAINT "FK_cae8b67f051b2496bedfa3f29d3"`);
        await queryRunner.query(`ALTER TABLE "shop_item" DROP CONSTRAINT "FK_3939c7a5081032b77d218546710"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_5b9be44cd82b487a2182b515d17"`);
        await queryRunner.query(`ALTER TABLE "quest_module" DROP CONSTRAINT "FK_395f0009d203413371a6bf0d8af"`);
        await queryRunner.query(`ALTER TABLE "level_module" DROP CONSTRAINT "FK_3aa68916c71ff79d210e37b4b80"`);
        await queryRunner.query(`ALTER TABLE "event_module" DROP CONSTRAINT "FK_05b6b326300a4ff012fc8d72d09"`);
        await queryRunner.query(`ALTER TABLE "economy_module" DROP CONSTRAINT "FK_9ff55fd4b5fcc16f79eab2f8eb3"`);
        await queryRunner.query(`ALTER TABLE "guild_member_daily_quest" DROP CONSTRAINT "FK_ebbe2fb7e4672d0d15088921a07"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP CONSTRAINT "FK_c6adfed3d6a7330d91a4f21ce1d"`);
        await queryRunner.query(`ALTER TABLE "guild_member" DROP CONSTRAINT "FK_079c272d9c6d2ccc45240ff246f"`);
        await queryRunner.query(`ALTER TABLE "guild_level_reward" DROP CONSTRAINT "FK_c40547f30f01dcfef6bff5823a7"`);
        await queryRunner.query(`ALTER TABLE "channel_blacklist" DROP CONSTRAINT "FK_3ea720478d5e62581d749570cf3"`);
        await queryRunner.query(`DROP TABLE "shop_item"`);
        await queryRunner.query(`DROP TABLE "shop"`);
        await queryRunner.query(`DROP TABLE "quest_module"`);
        await queryRunner.query(`DROP TABLE "level_module"`);
        await queryRunner.query(`DROP TABLE "event_module"`);
        await queryRunner.query(`DROP TABLE "economy_module"`);
        await queryRunner.query(`DROP TABLE "guild_member_daily_quest"`);
        await queryRunner.query(`DROP TABLE "guild_member"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "guild_level_reward"`);
        await queryRunner.query(`DROP TABLE "channel_blacklist"`);
        await queryRunner.query(`DROP TABLE "guild"`);
    }

}
