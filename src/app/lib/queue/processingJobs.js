import { getGuildModels } from '../mongodb/connection';
import getGuildModel from '../mongodb/models/Guild';
import { createLogger } from '../utils/logger';
import { registerProcessor } from './simpleQueue';

const logger = createLogger('TicketProcessor');

// Register the processors
export function initializeQueueProcessors() {
    // Process ticket creation jobs
    registerProcessor('ticket-creation', async (job) => {
        const { guildId, ticketData } = job.data;
        logger.info(`Processing ticket creation for guild ${guildId}`);

        try {
            const { Ticket } = await getGuildModels(guildId);
            const GuildModel = await getGuildModel();

            // Create the ticket
            const ticket = new Ticket(ticketData);
            await ticket.save();

            // Update guild stats
            await GuildModel.findOneAndUpdate(
                { guildId },
                {
                    $inc: {
                        'stats.totalTickets': 1,
                        'stats.openTickets': 1
                    }
                }
            );

            return { success: true, ticketId: ticket.ticketId };
        } catch (error) {
            logger.error(`Error creating ticket for guild ${guildId}:`, error);
            throw error;
        }
    });

    // Add other processors as needed
    registerProcessor('ticket-update', async (job) => {
        const { guildId, ticketId, updateData } = job.data;
        logger.info(`Processing ticket update for guild ${guildId}, ticket ${ticketId}`);

        try {
            const { Ticket } = await getGuildModels(guildId);
            return { success: true };
        } catch (error) {
            logger.error(`Error updating ticket ${ticketId}:`, error);
            throw error;
        }
    });

    registerProcessor('ticket-archive', async (job) => {
        const { guildId, ticketId } = job.data;
        logger.info(`Processing ticket archive for guild ${guildId}, ticket ${ticketId}`);

        try {
            const { Ticket } = await getGuildModels(guildId);
            return { success: true };
        } catch (error) {
            logger.error(`Error archiving ticket ${ticketId}:`, error);
            throw error;
        }
    });

    logger.info('Queue processors initialized');
}
