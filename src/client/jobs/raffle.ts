import { Cron } from 'croner'
import { jobsLogger } from './index'
import { RaffleContributorService } from '@/database/services/raffle-contributor.service'

import client from '../instance'
import { createNotifCard } from '@/ui/assets/cards/notifCard'

jobsLogger.info(({ yellowBright }) => `${yellowBright('Raffle Job')} started`, { arrowColor: 'greenBright' });

new Cron('0 0 * * 1', async () => {
    try {
        const winner = await RaffleContributorService.getRandomWinner();
        if (winner) {
            const guild = await client.guilds.fetch(winner.guildId);
            if (guild) {
                const member = await guild.members.fetch(winner.userId);
                if (member) {
                    const totalCoins = await RaffleContributorService.getTotalCoins();

                    await Promise.all([
                        RaffleContributorService.removeAll(),
                        member.send({
                            files: [
                                {
                                    attachment: await createNotifCard({
                                        text: `Vous avez gagné un total de ${totalCoins.toLocaleString('en')} pièce grâce à la cagnotte de cette semaine.`,
                                        theme: 'purple'
                                    }),
                                    name: 'gg.png'
                                }
                            ]
                        })
                    ]);
                }
            }
        }
    } catch (ex: any) {
        return jobsLogger.error(ex);
    }
}, { name: 'raffle-jobs', timezone: 'Europe/Paris' });
