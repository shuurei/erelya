import { Event } from '@/structures'

import prisma from '@/database/db'
import { startAllJobs } from '@/client/jobs/index.js'

export default new Event({
    once: true,
    name: 'clientSetup',
    async run() {
        const prismaTotalConnections = await prisma.adapter.connect()?.then((x) => x?.underlyingDriver()?.totalConnections());

        if (prismaTotalConnections > 0) {
            this.client.isDatabaseConnected = true;
            prisma.logger.info('Database connexion established', { arrowColor: 'greenBright' });
        } else {
            prisma.logger.info('Unable to connect to the database', { arrowColor: 'redBright' });
        }

        await startAllJobs();
    }
});