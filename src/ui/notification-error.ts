import { createNotifCard } from './assets/cards/notifCard'

export const notificationError = async (text: string) => ({
    embeds: [],
    files: [{
        attachment: await createNotifCard({ text: `[${text}]`, theme: 'red' }),
        name: 'failure.png'
    }]
});
