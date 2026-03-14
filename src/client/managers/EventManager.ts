import fg from 'fast-glob'
import { pathToFileURL } from 'url'

import logger from '@/utils/logger'
import { CustomClient, Event } from '@/structures'
import { EmbedUI } from '@/ui'

export interface LoadEventManagerOptions {
    directory: string;
}

export class EventManager {
    client: CustomClient;

    constructor(client: CustomClient) {
        this.client = client;
    }

    async listen(options: LoadEventManagerOptions) {
        logger.info('Starting client events loading..', { arrowColor: 'orangeBright' });

        const cwd = './src/client';
        const path = options.directory.concat('/**/*.{ts,js}');

        let stats = {
            valid: 0,
            invalid: 0
        }
        
        const files = await fg(path, { cwd });

        if (files.length > 0) {
            logger.header(({ orange }) => orange('✦ EVENTS ✦'));

            for (const filePath of files) {
                const mod = (await import(pathToFileURL(`${cwd}/${filePath}`).href))?.default;
                if (!(mod instanceof Event) || !mod.name) {
                    stats.invalid++;
                    continue
                };
    
                const listenerType = mod.once ? 'once' : 'on';
    
                this.client[listenerType](mod.name, async (...args) => {
                    try {
                        const newThis = Object.assign(mod, { client: this.client });
                        return await mod.run.call(newThis, { events: args });
                    } catch (ex) {
                        if (this.client.hub && this.client.hub?.heartLogsChannel) {
                            logger.error(ex);
    
                            const potentialGuild = args[0]?.guild;
                            const potentialUser = args[0]?.user;
    
                            await this.client.hub.heartLogsChannel.send({
                                embeds: [
                                    EmbedUI.create({
                                        color: 'blue',
                                        title: `⚡ Event Error`,
                                        description: [
                                            `- Event: \`${mod.name}\``,
                                            potentialGuild && [`- Guild`,
                                                `  - \`${potentialGuild?.name}\``,
                                                `  - \`${potentialGuild?.id}\``],
                                            potentialUser && [`- Author`,
                                                `  - \`${potentialUser?.username}\``,
                                                `  - \`${potentialUser?.id}\``],
                                        ].filter(Boolean).flat().join(`\n`)
                                    }),
                                    EmbedUI.create({
                                        color: 'red',
                                        title: '🐞 Stack',
                                        description: `>>> ${ex?.stack}`
                                    })
                                ],
                            });
                        }
                    }
                });
    
                stats.valid++;
                logger.log(({ custom }) => `⚡ ${custom('#fff383', mod.name.toCapitalize())}`);
            }
    
            logger.separator();
            
            if (stats.invalid) {
                logger.info(({ redBright }) => `${redBright(stats.invalid)} invalid events`, { arrowColor: 'redBright' });
            }
    
            logger.info(({ greenBright }) => `Listening ${greenBright(stats.valid)} events`, { arrowColor: 'greenBright' });
        } else {
            logger.info(({ redBright }) => redBright(`No client event were detected to load`), { arrowColor: 'red' });
        }
    }
}

