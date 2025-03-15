import { NextResponse } from 'next/server';
import { getGuildModels } from '@/lib/mongodb/connection';
import getGuildModel from '@/lib/mongodb/models/Guild';
import { queueTicketCreation } from '@/lib/queue/ticketQueue';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('Tickets');

// Get all tickets for a guild
export async function GET(request, { params }) {
    try {
        const { guildId } = params;
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        // Prepare query
        const query = { };
        if (status) query.status = status;

        // Get ticket model for this guild
        const { Ticket } = await getGuildModels(guildId);

        // Count total matching tickets
        const total = await Ticket.countDocuments(query);

        // Get tickets with pagination
        const tickets = await Ticket.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            tickets,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        logger.error(`Error fetching tickets for guild ${params.guildId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Create a new ticket
export async function POST(request, { params }) {
    try {
        const { guildId } = params;
        const body = await request.json();

        // Validate input
        if (!body.createdBy || !body.subject) {
            return NextResponse.json({
                error: 'Missing required fields (createdBy, subject)'
            }, { status: 400 });
        }

        // Get Guild model to generate ticket ID
        const GuildModel = await getGuildModel();
        const guild = await GuildModel.findOne({ guildId });

        if (!guild) {
            return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
        }

        // Generate ticket ID
        const ticketNumber = guild.stats.totalTickets + 1;
        const ticketId = `${guild.config.ticketPrefix || 'ticket-'}${ticketNumber.toString().padStart(4, '0')}`;

        // Prepare ticket data
        const ticketData = {
            ticketId,
            createdBy: body.createdBy,
            subject: body.subject,
            status: 'open',
            messages: body.initialMessage ? [
                {
                    authorId: body.createdBy,
                    content: body.initialMessage,
                    timestamp: new Date()
                }
            ] : []
        };

        // Queue ticket creation job
        const job = await queueTicketCreation(guildId, ticketData);

        return NextResponse.json({
            success: true,
            message: 'Ticket creation queued',
            ticketId,
            jobId: job.id
        });
    } catch (error) {
        logger.error(`Error creating ticket for guild ${params.guildId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
