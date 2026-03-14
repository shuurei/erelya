import 'dotenv/config'
import './helpers/extends/String'
import './helpers/extends/Math'

const env = process.env.ENV;
process.title = `${pkg.name.toUpperCase()} - Terminal`

import pkg from '@pkg'
import { version as djsVersion } from 'discord.js'
import { Prisma } from './database/core/client'

import logger from './utils/logger'
import client from './client/instance'

import { GlobalFonts } from '@napi-rs/canvas'

import path from 'path'
import os from 'os'

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

logger.header(({ custom }) => custom(env === 'DEV' ? '#ff8f8f' : env === 'PROD' ? '#8fffab' : '#ffe18f', `✦ ${env} - v${pkg.version} ✦`));
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
        label: 'Prisma',
        value: `v${Prisma.prismaVersion.client}`
    }
])
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

await client.start();