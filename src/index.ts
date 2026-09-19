import 'dotenv/config'
import 'reflect-metadata'

import './helpers/extends/String'
import './helpers/extends/Math'

import pkg from '@pkg'
import { execSync } from 'child_process'

const env = process.env.ENV;
process.title = pkg.name.toUpperCase();

const now = new Date();

if (!process.env.BUILD_VERSION) {
    process.env.BUILD_VERSION = `${String(now.getUTCFullYear()).slice(-2)}.${String(now.getUTCMonth() + 1).padStart(2, '0')}.${String(now.getUTCDate()).padStart(2, '0')}`;
}

if (!process.env.BUILD_NUMBER) {
    process.env.BUILD_NUMBER = `${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}`;
}

if (!process.env.GIT_COMMIT) {
    process.env.GIT_COMMIT = execSync(`git rev-parse --short HEAD`, { encoding: 'utf8', }).trim();
}

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

logger.header(({ custom }) => custom(env === 'DEV' ? '#ff8f8f' : env === 'PROD' ? '#8fffab' : '#ffe18f', `✦ ${env} ✦`));
logger.list([
    {
        label: 'Build Version',
        value: process.env.BUILD_VERSION
    },
    {
        label: 'Build Number',
        value: process.env.BUILD_NUMBER
    },
    {
        label: 'Git Commit',
        value: process.env.GIT_COMMIT
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