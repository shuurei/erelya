import { GatewayIntentBits, Partials } from 'discord.js'
import { CustomClient } from '@/structures/CustomClient'

export const client = new CustomClient({
    intents: [
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Reaction,
        Partials.Message,
        Partials.Channel,
        Partials.User
    ]
});

export default client;