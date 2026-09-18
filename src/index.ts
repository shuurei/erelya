import 'dotenv/config'
import './helpers/extends/String'
import './helpers/extends/Math'
import 'reflect-metadata'

import pkg from '@pkg'

const env = process.env.ENV;
process.title = pkg.name.toUpperCase();

import { version as djsVersion } from 'discord.js'
import typeormPkg from 'typeorm/package.json' with { type: 'json' }

import logger from './utils/logger'
import client from './client/instance'

import { GlobalFonts } from '@napi-rs/canvas'

import path from 'path'
import os from 'os'
import { db } from './database/db'

GlobalFonts.registerFromPath(path.join(
    process.cwd(),
    'src',
    'ui',
    'assets',
    'fonts',
    'Quantico-Bold.ttf'
), 'Quantico Bold');

const ASCII_LOGO = [
    `@@@@@@@@  @@@@@@@   @@@@@@@@  @@@       @@@ @@@   @@@@@@`,
    `@@@@@@@@  @@@@@@@@  @@@@@@@@  @@@       @@@ @@@  @@@@@@@@`,
    `@@!       @@!  @@@  @@!       @@!       @@! !@@  @@!  @@@`,
    `!@!       !@!  @!@  !@!       !@!       !@! @!!  !@!  @!@`,
    `@!!!:!    @!@!!@!   @!!!:!    @!!        !@!@!   @!@!@!@!`,
    `!!!!!:    !!@!@!    !!!!!:    !!!         @!!!   !!!@!!!!`,
    `!!:       !!: :!!   !!:       !!:         !!:    !!:  !!!`,
    `:!:       :!:  !:!  :!:        :!:        :!:    :!:  !:!`,
    ` :: ::::  ::   :::   :: ::::   :: ::::     ::    ::   :::`,
    `: :: ::    :   : :  : :: ::   : :: : :     :      :   : :`
] as const;

logger.defaultMaxLineLength = ASCII_LOGO[1].length;

logger.log(({ gradient }) =>
    ASCII_LOGO.map((line) => gradient('#5053ff', '#9650ff', line)).join('\n')
);

logger.header(({ custom }) => custom(env === 'DEV' ? '#ff8f8f' : env === 'PROD' ? '#8fffab' : '#ffe18f', env === 'DEV' ? `✦ ${env} ✦` :  `✦ ${env} - v${pkg.version} ✦`));
logger.list([
    {
        label: 'DiscordJs',
        value: `v${djsVersion}`
    },
    {
        label: 'NodeJs',
        value: process.version
    },
    {
        label: 'Typeorm',
        value: `v${typeormPkg.version}`
    }
]);
logger.header(({ purpleBright }) => purpleBright('✦ OPERATING SYSTEM ✦'));
logger.list([
    {
        label: 'Type',
        value: os.version()
    },
    {
        label: 'Version',
        value: os.release()
    },
]);

logger.header(({ purpleBright }) => purpleBright('✦ DATABASE ✦'));

try {
    await db.initialize();
    logger.info('Database connexion established', { arrowColor: 'greenBright' });
    await client.start();
} catch (err: any) {
    throw new Error('Initialization failed', { cause: logger.error(err) });
}