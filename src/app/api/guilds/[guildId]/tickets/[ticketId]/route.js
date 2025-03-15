import { NextResponse } from 'next/server';
import { getGuildModels } from '@/lib/mongodb/connection';
import { queueTicketUpdate, queueTicketArchive } from '@/lib/queue/ticketQueue';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('TicketOperations');

// Get a specific ticket
export async function GET(request, { params }) {
    try {
        const { guildId, ticketId } = params;

        // Get ticket model for this guild
        const { Ticket } = await getGuildModels(guildId);

        // Find the ticket
        const ticket = await Ticket.findOne({ ticketId });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        logger.error(`Error fetching ticket ${params.ticketId} for guild ${params.guildId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Update a ticket
export async function PATCH(request, { params }) {
    try {
        const { guildId, ticketId } = params;
        const body = await request.json();

        // Queue the update
        const job = await queueTicketUpdate(guildId, ticketId, body);

        return NextResponse.json({
            success: true,
            message: 'Ticket update queued',
            jobId: job.id
        });
    } catch (error) {
        logger.error(`Error updating ticket ${params.ticketId} for guild ${params.guildId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Archive a ticket
export async function DELETE(request, { params }) {
    try {
        const { guildId, ticketId } = params;

        // Queue the archive job
        const job = await queueTicketArchive(guildId, ticketId);

        return NextResponse.json({
            success: true,
            message: 'Ticket archive queued',
            jobId: job.id
        });
    } catch (error) {
        logger.error(`Error archiving ticket ${params.ticketId} for guild ${params.guildId}:`, error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
