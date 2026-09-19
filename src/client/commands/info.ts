import { version as discordVersion } from 'discord.js'

import { db } from '@/database/db'
import { Command, CustomClient } from '@/structures'
import { EmbedUI } from '@/ui'

function formatUptime(seconds: number) {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return [
        days && `${days}j`,
        hours && `${hours}h`,
        minutes && `${minutes}m`,
        secs && `${secs}s`,
    ].filter(Boolean).join(' ') || '0s';
}

const buildPayload = async (client: CustomClient) => {
    const discordStart = Date.now();
    await db.query('SELECT 1');
    const databasePing = Date.now() - discordStart;

    return {
        embeds: [EmbedUI.create({
            color: 'indigo',
            title: 'Information',
            fields: [
                {
                    name: 'Versions',
                    value: [
                        `> Build \`${process.env.BUILD_VERSION}\``,
                        `> Numéro \`${process.env.BUILD_NUMBER}\``,
                        `> Commit \`${process.env.GIT_COMMIT}\``,
                    ].join('\n')
                },
                {
                    name: 'Ping',
                    value: [
                        `> Discord WebSocket \`${client.ws.ping}ms\``,
                        `> Database \`${databasePing}ms\``,
                    ].join('\n')
                },
                {
                    name: 'Runtime',
                    value: [
                        `> Node.js \`${process.version}\``,
                        `> discord.js \`v${discordVersion}\``,
                        `> Uptime \`${formatUptime(process.uptime())}\``,
                    ].join('\n')
                }
            ]
        })]
    } as const;
}

export default new Command({

    description: 'Affiche les informations d’Erelya.',

    async onMessage(message) {
        const payload = await buildPayload(this.client)
        await message.reply(payload)
    },

    async onInteraction(interaction) {
        await interaction.deferReply()

        const payload = await buildPayload(this.client)
        await interaction.editReply(payload)
    }
});