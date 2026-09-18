import { NodeEnv } from './nodeEnv'

export type NodeEnv = 'DEV' | 'PROD';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PREFIX: string;
            ENV: NodeEnv;
            // CLIENT
            DEBUG?: string;
            TOKEN: string;
            // HUB
            HUB_GUILD_ID?: string;
            HUB_HEART_LOGS_CHANNEL_ID?: string;
            // DISCORD
            CLIENT_ID: string;
            CLIENT_TOKEN?: string;
            // DATABASE
            DATABASE_HOST: string;
            DATABASE_PORT: number;
            DATABASE_USER: string;
            DATABASE_PASSWORD: string;
            DATABASE_NAME: string;
        }
    }
}

export {};