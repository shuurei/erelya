import { GatewayIntentBits, Partials } from 'discord.js'
import { ErelyaClient } from '@/structures/ErelyaClient'

export const client = new ErelyaClient({
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