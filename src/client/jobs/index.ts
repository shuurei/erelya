import logger from '@/utils/logger'

export const jobsLogger = logger.use({
    prefix: ({ white, cyanBright }) => white(`[${cyanBright(`JOBS`)}] <🕛>`)
});

export const startAllJobs = async () => {
    logger.info('Starting jobs..', { arrowColor: 'orangeBright' });
    await import('./tick.js');
    logger.info('All jobs loaded', { arrowColor: 'greenBright' });
}

export default {
    startAllJobs,
    logger
}
