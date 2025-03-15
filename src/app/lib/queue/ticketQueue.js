import Queue from 'bull';
import { createLogger } from '../utils/logger';

const logger = createLogger('TicketQueue');

// Create Redis connection string or use in-memory implementation for simpler setups
const REDIS_URL = process.env.REDIS_URL || null;

// Initialize the queues
export const ticketCreationQueue = new Queue('ticket-creation', REDIS_URL ? REDIS_URL : undefined);
export const ticketUpdateQueue = new Queue('ticket-update', REDIS_URL ? REDIS_URL : undefined);
export const ticketArchiveQueue = new Queue('ticket-archive', REDIS_URL ? REDIS_URL : undefined);

// Set up logging for each queue
[ticketCreationQueue, ticketUpdateQueue, ticketArchiveQueue].forEach(queue => {
    queue.on('completed', job => {
        logger.info(`Job ${job.id} completed in queue ${queue.name}`);
    });

    queue.on('failed', (job, err) => {
        logger.error(`Job ${job.id} failed in queue ${queue.name}:`, err);
    });

    queue.on('error', err => {
        logger.error(`Error in queue ${queue.name}:`, err);
    });
});

// Helper functions for adding jobs to queues
export async function queueTicketCreation(guildId, ticketData) {
    return ticketCreationQueue.add({ guildId, ticketData }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    });
}

export async function queueTicketUpdate(guildId, ticketId, updateData) {
    return ticketUpdateQueue.add({ guildId, ticketId, updateData }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    });
}

export async function queueTicketArchive(guildId, ticketId) {
    return ticketArchiveQueue.add({ guildId, ticketId }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    });
}
