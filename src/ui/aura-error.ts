import { createNotifCard } from './assets/cards/notifCard'

export const auraError = async (text: string) => {
    return {
        embeds: [],
        files: [{
            attachment: await createNotifCard({ text: `[${text}]`, theme: 'red' }),
            name: 'failure.png'
        }]
    };
}
