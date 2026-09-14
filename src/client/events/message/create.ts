import { Event, MessageCommandStyle } from '@/structures'

import {
    userService,
    memberService,
    guildModuleService,
    channelBlacklistService,
    guildService,
    memberDailyQuestService,
} from '@/database/services'

import {
    createCooldown,
    randomNumber,
    timeElapsedFactor,
} from '@/utils'

import { createActionRow, createButton } from '@/ui/components/common'

import { handleMemberCheckLevelUp } from '@/client/handlers/member-check-level-up'
import { handleMemberDailyQuestSync } from '@/client/handlers/member-daily-quest-sync'
import { handleMemberDailyQuestNotify } from '@/client/handlers/member-daily-quest-notify'
import { createNotifCard } from '@/ui/assets/cards/notifCard'

/** @deprecated */
const channelsAutomaticThread = [
    '1351619802002886706',
    '1405139939988996207'
]

const factor = (condition: any, value = 0) => condition ? value : 0;

export default new Event({
    name: 'messageCreate',
    async run({ events: [message] }) {
        if (message.author.bot || !message.guild || !message.member) return;

        const userId = message.author.id;
        const guild = message.guild
        const guildId = guild.id;
        const channelId = message.channel.id;

        const channelScopeBlacklist = await channelBlacklistService.findMany({ guildId, channelId });

        const now = Date.now();
        const content = message.content.trim();

        let userSpamData = this.client.spamBuffer.get(userId);

        if (userSpamData && userSpamData.guildId === guildId) {
            const interval = now - userSpamData.lastMessageAt;
            const lastInterval = userSpamData.lastInterval ?? interval;

            let score = 0;

            if (interval < 750) {
                score += 1;
            }

            if (userSpamData.lastContent === content && content.length > 1) {
                score += 2;
            }

            if (Math.abs(interval - lastInterval) <= 75) {
                score += 3;
            }

            if (score === 0) {
                userSpamData.messageCount = 0;
            } else {
                userSpamData.messageCount += score;
            }

            userSpamData.lastInterval = interval;
            userSpamData.lastMessageAt = now;
            userSpamData.lastContent = content;

            this.client.spamBuffer.set(userId, userSpamData);
        } else {
            this.client.spamBuffer.set(userId, {
                guildId,
                lastMessageAt: now,
                lastInterval: undefined,
                lastContent: content,
                messageCount: 0,
            });
        }

        const prefix = process.env.PREFIX;

        const messageStartsWithPrefix = message.content.startsWith(prefix)

        if (messageStartsWithPrefix && !channelScopeBlacklist.COMMAND) {
            let args = message.content
                .slice(prefix.length)
                .trim()
                .split(/\s+/);

            const command = this.client.commands.resolveMessageCommand(args);
            if (
                !command
                || (
                    command.access?.guild?.authorizedIds
                    && !command.access.guild.authorizedIds.includes(message.guild.id)
                )
            ) return;

            if (command.messageCommand.style === MessageCommandStyle.SLASH_COMMAND) {
                args = args.slice(command.structure.message!.parts!.length + 1);
            } else {
                args = args.slice(1);
            }

            return this.client.emit('commandCreate', command, message, args);
        }

        if (this.client.mainGuild?.id === guildId) {
            if (process.env.ENV === 'PROD' && channelsAutomaticThread.includes(message.channel.id)) {
                if (message.attachments.size > 0) {
                    return await message.startThread({
                        name: `Discussion avec ${message.author.username}`,
                    });
                } else {
                    return await message.delete();
                }
            }
        };

        if (!(messageStartsWithPrefix || channelScopeBlacklist.MESSAGE)) {
            await memberService.incrementMessageCount({ userId, guildId });
        }

        const [
            userDatabase,
            guildDatabase,
            guildEcoModule,
            guildLevelModule,
            guildEventModule,
            guildQuestModule
        ] = await Promise.all([
            userService.findById(userId),
            guildService.findById(guildId),
            guildModuleService.findById({ guildId, moduleName: 'eco' }),
            guildModuleService.findById({ guildId, moduleName: 'level' }),
            guildModuleService.findById({ guildId, moduleName: 'event' }),
            guildModuleService.findById({ guildId, moduleName: 'quest' })
        ]);

        if (guildEventModule?.isActive && guildEventModule.settings) {
            const { settings } = guildEventModule;

            const { isActive } = createCooldown(
                guildDatabase?.lastEventAt,
                guildEventModule.settings.randomEventCooldownMinutes * 60 * 1000
            );

            if (!isActive && (Math.random() < settings.randomEventChance)) {
                const chance = Math.random();

                if (
                    settings.isCoinEventEnabled
                    && (chance < settings.coinsChance)
                ) {
                    await guildService.setLastEventAt(guild.id);
                    const randomCoins = randomNumber(settings.coinsMinGain, settings.coinsMaxGain);

                    const buttons = [
                        createButton({
                            color: 'gray',
                            label: `Prendre la bourse abandonnée`,
                            customId: 'take'
                        }),
                    ];

                    if (Math.random() < 0.5) {
                        buttons.push(createButton({
                            color: 'gray',
                            label: `Inspecter la zone`,
                            customId: 'inspect'
                        }));
                    }

                    const scenarioNumber = Math.floor(Math.random() * 1000);

                    const msg = await message.channel.send({
                        files: [
                            {
                                attachment: await createNotifCard({
                                    text: `[Scénario #${scenarioNumber} - Alors que vous marchez dans la ville, vous remarquez une bourse abandonnée au sol.]`,
                                    fontSize: 20
                                }),
                                name: 'event.png'
                            }
                        ],
                        components: [
                            createActionRow(buttons)
                        ]
                    });

                    try {
                        const i = await msg.awaitMessageComponent({ time: 30_000 });

                        let coinsGained = randomCoins;
                        let description = '';

                        const RNG = Math.random();

                        if (RNG < 0.1) {
                            coinsGained = 0;
                            description = `${i.user.username} décide de prendre la bourse, mais il n'y avait rien à l'intérieur.`;
                        } else if (i.customId === 'take') {
                            description = `${i.user.username} décide de prendre la bourse abandonnée et de l'ouvrir. À l'intérieur, vous trouvez ${coinsGained.toLocaleString('en')} pièces.`;
                        } else if (i.customId === 'inspect') {
                            if (RNG < 0.4) {
                                coinsGained += Math.floor(coinsGained * 0.25);
                                description = `${i.user.username} inspecte et aide la grand-mère qui avait perdu la bourse. Vous gagnez un bonus et obtenez **${coinsGained.toLocaleString('en')} pièces.`;
                            } else {
                                description = `${i.user.username} inspecte les alentours mais ne voyez personne. Vous ouvrez la bourse et découvrez ${coinsGained.toLocaleString('en')} pièces.`;
                            }
                        }

                        await memberService.addGuildCoins({ guildId, userId: i.user.id }, coinsGained);

                        await i.update({
                            files: [
                                {
                                    attachment: await createNotifCard({
                                        text: `Scénario #${scenarioNumber} - ${description}`,
                                        fontSize: 18
                                    }),
                                    name: 'response.png'
                                }
                            ],
                            components: []
                        });
                    } catch {
                        await guildService.setLastEventAt(guild.id, null);
                        if (msg.deletable) {
                            await msg.delete();
                        }
                    }
                } else if (
                    settings.isXpEventEnabled
                    && (chance < settings.xpChance)
                ) {
                    await guildService.setLastEventAt(guild.id);
                    const randomXp = randomNumber(settings.xpMinGain, settings.xpMaxGain);

                    const buttons = [
                        createButton({
                            color: 'gray',
                            label: 'Lire le grimoire',
                            customId: 'read'
                        })
                    ];

                    if (Math.random() < 0.7) {
                        buttons.push(createButton({
                            color: 'gray',
                            label: 'Lire attentivement',
                            customId: 'focus'
                        }));
                    }

                    const scenarioNumber = Math.floor(Math.random() * 1000);

                    const msg = await message.channel.send({
                        files: [
                            {
                                attachment: await createNotifCard({
                                    text: `[Scénario #${scenarioNumber} - Un ancien grimoire est posé sur un banc.]`,
                                    fontSize: 20
                                }),
                                name: 'event.png'
                            }
                        ],
                        components: [
                            createActionRow(buttons)
                        ]
                    });

                    try {
                        const i = await msg.awaitMessageComponent({ time: 30_000 });

                        let xpGained = randomXp;
                        let description = '';

                        const RNG = Math.random();

                        if (RNG < 0.1) {
                            xpGained = 0;
                            description = `${i.user.username} ouvre le grimoire, mais les arcanes restent impénétrables.`;
                        } else if (i.customId === 'read') {
                            description = `${i.user.username} feuillette le grimoire. D'anciens secrets se révèlent, et ${xpGained.toLocaleString('en')} XP sont acquis.`;
                        } else if (i.customId === 'focus') {
                            if (RNG < 0.4) {
                                xpGained += Math.floor(xpGained * 0.25);
                                description = `${i.user.username} plonge dans la lecture attentive du grimoire. Des passages cachés apparaissent, accordant ${xpGained.toLocaleString('en')} XP supplémentaires.`;
                            } else {
                                description = `${i.user.username} médite sur les runes du grimoire, discernant quelques secrets. ${xpGained.toLocaleString('en')} XP sont gagnés.`;
                            }
                        }

                        await handleMemberCheckLevelUp({
                            member: guild.members.cache.get(i.user.id),
                            channel: message.channel,
                            xpGain: xpGained
                        });

                        await i.update({
                            files: [
                                {
                                    attachment: await createNotifCard({
                                        text: `Scénario #${scenarioNumber} - ${description}`,
                                        fontSize: 18
                                    }),
                                    name: 'response.png'
                                }
                            ],
                            components: []
                        });
                    } catch {
                        await guildService.setLastEventAt(guild.id, null);
                        if (msg.deletable) {
                            await msg.delete();
                        }
                    }
                }
            }
        }

        const guildBoostElapsedProgress = timeElapsedFactor(message?.member?.premiumSince, 7);
        const tagBoostElapsedProgress = timeElapsedFactor(userDatabase?.tagAssignedAt, 14);

        if (guildEcoModule?.isActive && !channelScopeBlacklist.ECONOMY) {
            const { settings } = guildEcoModule;

            if (settings?.guildPointsFromMessageEnabled) {
                if (Math.random() < settings.messageChance) {
                    const maxGain = settings.messageMaxGain;
                    const minGain = settings.messageMinGain;

                    // Penalty
                    const spamFactor = factor(userSpamData?.messageCount, (userSpamData?.messageCount ?? 0) / 5);

                    // Bonus
                    const guildBoostFactor = factor(settings.boosterFactor, guildBoostElapsedProgress * settings.boosterFactor);
                    const tagBoostFactor = factor(settings.tagSupporterFactor, tagBoostElapsedProgress * settings.tagSupporterFactor);

                    const bonusFactor = tagBoostFactor + guildBoostFactor;

                    const randomCoins = Math.floor(randomNumber(minGain, maxGain) * (1 + (bonusFactor)) * (1 - spamFactor));

                    if (randomCoins > 0) {
                        await memberService.addGuildCoins({
                            userId,
                            guildId,
                        }, randomCoins);
                    }
                }
            }
        }

        if (guildLevelModule?.isActive && !channelScopeBlacklist.LEVEL) {
            const { settings } = guildLevelModule;

            if (settings?.isXpFromMessageEnabled && Math.random() < settings.messageChance) {
                const maxGain = 125;
                const minGain = 75;

                // Penalty
                const spamFactor = factor(userSpamData?.messageCount, (userSpamData?.messageCount ?? 0) / 5);

                // Bonus
                const guildBoostFactor = factor(settings.boosterFactor, guildBoostElapsedProgress * settings.boosterFactor);
                const tagBoostFactor = factor(settings.tagSupporterFactor, tagBoostElapsedProgress * settings.tagSupporterFactor);

                const bonusFactor = tagBoostFactor + guildBoostFactor;

                const randomXP = Math.floor(
                    randomNumber(minGain, maxGain) * (1 + bonusFactor) * (1 - spamFactor)
                );

                if (randomXP > 0) {
                    await handleMemberCheckLevelUp({
                        member: message.member,
                        channel: message.channel,
                        xpGain: randomXP
                    });
                }
            }
        }
    }
});