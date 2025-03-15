import { createLogger } from '../utils/logger';

const logger = createLogger('Queue');

// In-memory queue for development
const queues = {
    'ticket-creation': [],
    'ticket-update': [],
    'ticket-archive': []
};

// Simple processor functions
const processors = {
    'ticket-creation': null,
    'ticket-update': null,
    'ticket-archive': null
};

// Process the next item in a queue
async function processNext(queueName) {
    if (queues[queueName].length === 0) return;

    const job = queues[queueName].shift();
    if (!processors[queueName]) {
        logger.warn(`No processor registered for queue ${queueName}`);
        return;
    }

    try {
        logger.info(`Processing job in ${queueName}`);
        await processors[queueName](job);
    } catch (error) {
        logger.error(`Error processing job in ${queueName}:`, error);
        // Re-queue the job if it should be retried
        if (job.attempts < job.maxAttempts) {
            job.attempts++;
            queues[queueName].push(job);
        }
    }
}

// Process queues periodically
function startProcessing() {
    setInterval(() => {
        Object.keys(queues).forEach(queueName => {
            if (queues[queueName].length > 0) {
                processNext(queueName);
            }
        });
    }, 1000); // Check every second
}

// Add a job to a queue
export function addJob(queueName, data, options = {}) {
    const job = {
        id: Date.now().toString(),
        data,
        attempts: 0,
        maxAttempts: options.attempts || 3,
        createdAt: new Date()
    };

    queues[queueName].push(job);
    logger.info(`Added job to ${queueName}, queue length: ${queues[queueName].length}`);

    return job;
}

// Register a processor for a queue
export function registerProcessor(queueName, processorFn) {
    processors[queueName] = processorFn;
    logger.info(`Registered processor for ${queueName}`);
}

// Helper functions that mimic the Bull API
export function queueTicketCreation(guildId, ticketData) {
    return addJob('ticket-creation', { guildId, ticketData });
}

export function queueTicketUpdate(guildId, ticketId, updateData) {
    return addJob('ticket-update', { guildId, ticketId, updateData });
}

export function queueTicketArchive(guildId, ticketId) {
    return addJob('ticket-archive', { guildId, ticketId });
}

// Initialize the queue system
export function initializeQueueSystem() {
    startProcessing();
    logger.info('Queue system initialized');
    return { addJob, registerProcessor };
}
