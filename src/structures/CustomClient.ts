import { Client, ClientOptions, ActivityType, DiscordjsErrorCodes, DefaultWebSocketManagerOptions, Guild, TextChannel, Collection, ForumChannel, ChannelType } from 'discord.js'
import { CallSessionManager, CommandManager, EventManager } from '@/client/managers'

import logger from '@/utils/logger'

import { randomNumber } from '@/utils/number'
import { mainGuildConfig } from '@/client/config/mainGuild'

import { CustomClientEvents } from './Event'
import { Logger } from './Logger'

export interface CustomClientMainGuildData {
    id: string;
    welcomeChannelId: string;
}

interface CustomClientSpamBufferData {
    guildId: string;
    lastMessageAt: number;
    lastInterval?: number;
    lastContent?: string;
    messageCount: number;
}

import { startAllJobs } from '@/client/jobs'

export class CustomClient extends Client {
    hub?: Guild & {
        ticketChannel?: ForumChannel;
        heartLogsChannel?: TextChannel;
    };

    mainGuild!: Guild & {
        welcomeChannel: TextChannel;
    };

    events: EventManager;
    commands: CommandManager;
    callSessions: CallSessionManager;
    spamBuffer: Collection<string, CustomClientSpamBufferData>;

    logger: Logger;

    on<Event extends keyof CustomClientEvents>(
        event: Event,
        listener: (...args: CustomClientEvents[Event]) => void
    ) {
        return super.on(event as string, listener);
    };

    once<Event extends keyof CustomClientEvents>(
        event: Event,
        listener: (...args: CustomClientEvents[Event]) => void
    ) {
        return super.once(event as string, listener);
    };

    emit<Event extends keyof CustomClientEvents>(
        event: Event,
        ...args: CustomClientEvents[Event]
    ) {
        return super.emit(event as string, ...args);
    };

    off<Event extends keyof CustomClientEvents>(
        event: Event,
        listener: (...args: CustomClientEvents[Event]) => void
    ) {
        return super.off(event as string, listener);
    };

    removeAllListeners<Event extends keyof CustomClientEvents>(event?: Event) {
        return super.removeAllListeners(event as string);
    };

    get reflexions() {
        return [
            `v${process.env.BUILD_VERSION} (${process.env.BUILD_NUMBER})`,
            "Bonjour, le monde !",
            "existential.exe en cours d'exécution..",
            "J'❤ Radiohead",
            "J'❤ Daniel Caesar",
            "La prédiction du chaos.. Est plutôt juste ?"
        ] as const;
    }

    constructor(options: ClientOptions) {
        super({
            ...options,
            ws: {
                buildStrategy(manager) {
                    manager.options.identifyProperties.browser = 'Discord Android';
                    return DefaultWebSocketManagerOptions?.buildStrategy(manager);
                }
            }
        });

        this.events = new EventManager(this);
        this.commands = new CommandManager(this);
        this.callSessions = new CallSessionManager(this);

        this.spamBuffer = new Collection();

        this.logger = logger.use({
            prefix: (c) => c.white(`[CLIENT] <🤖>`)
        });
    }

    randomReflexion() {
        if (this.user) {
            const reflexion = this.reflexions[Math.floor(Math.random() * this.reflexions.length)];
            this.user.setActivity(reflexion, { type: ActivityType.Custom });
            return reflexion;
        }
    }

    async login(token?: string) {
        logger.info(`The client is trying to connect to Discord..`, { arrowColor: 'orangeBright' });

        token ??= process.env.CLIENT_TOKEN;

        if (!token) {
            throw new Error(DiscordjsErrorCodes.TokenMissing);
        }

        if (typeof token !== 'string') {
            throw new Error(DiscordjsErrorCodes.TokenInvalid);
        }

        this.token = token;
        this.rest.setToken(token);

        return await super.login(this.token).then(async (token) => {
            const user = this.user;
            if (user) {
                this.logger = logger.use({
                    prefix: ({ purple, purpleBright }) => {
                        return purple('[').concat(purpleBright(user.username)).concat(purple(']'));
                    }
                });

                await this.commands.syncSlashCommands();

                if (process.env.HUB_GUILD_ID) {
                    this.logger.info('Initializing client hub', { arrowColor: 'orangeBright' });

                    const hub = await this.guilds.fetch(process.env.HUB_GUILD_ID);
                    if (!hub) {
                        throw new Error(`❌ » Hub guild not found (${process.env.HUB_GUILD_ID})`);
                    }

                    if (process.env.HUB_TICKET_CHANNEL_ID) {
                        const ticketChannel = await hub.channels.fetch(process.env.HUB_TICKET_CHANNEL_ID);
                        if (ticketChannel?.type === ChannelType.GuildForum) {
                            this.hub = Object.assign(hub, {
                                ticketChannel
                            });

                            this.logger.info('Hub ticket channel initialized', { arrowColor: 'greenBright' });
                        } else {
                            throw new Error(`❌ » Hub ticket channel invalid (${process.env.HUB_TICKET_CHANNEL_ID})`);
                        }
                    } else {
                        this.logger.info(`Hub Ticket Channel skipped`, { arrowColor: 'orangeBright' });
                    }

                    if (process.env.HUB_HEART_LOGS_CHANNEL_ID) {
                        const heartLogsChannel = await hub.channels.fetch(process.env.HUB_HEART_LOGS_CHANNEL_ID);
                        if (heartLogsChannel?.type === ChannelType.GuildText) {
                            this.hub = Object.assign(hub, { heartLogsChannel });

                            this.logger.info('Hub heart logs initialized', { arrowColor: 'greenBright' });
                        } else {
                            throw new Error(`❌ » Hub heart logs channel invalid (${process.env.HUB_HEART_LOGS_CHANNEL_ID})`);
                        }
                    } else {
                        this.logger.info(`Hub Heart Logs skipped`, { arrowColor: 'orangeBright' });
                    }

                    this.emit('hubReady', hub);
                    this.logger.info('Hub initialized', { arrowColor: 'greenBright' });
                } else {
                    this.logger.info('Skipped hub initialization', { arrowColor: 'orangeBright' });
                }

                const mainGuild = await this.guilds.fetch(mainGuildConfig.id);

                this.mainGuild = Object.assign(mainGuild,
                    {
                        welcomeChannel: await mainGuild.channels.fetch(mainGuildConfig.welcomeChannelId),
                    }
                ) as Guild & {
                    welcomeChannel: TextChannel;
                };

                if (this.application) {
                    await this.application.fetch();
                    await this.application.emojis.fetch();
                }

                this.randomReflexion();
                setInterval(() => this.randomReflexion(), randomNumber(1, 10) * 60 * 1000);
            }

            await startAllJobs();

            return token;
        });
    }

    async start(token?: string) {
        logger.header(({ purpleBright }) => purpleBright('✦ CLIENT ✦'));

        await this.events.listen({ directory: 'events' });
        await this.commands.load({ directory: 'commands' });

        return await this.login(token);
    }
}