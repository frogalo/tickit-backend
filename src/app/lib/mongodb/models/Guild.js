import mongoose from 'mongoose';
import { getMainConnection } from '../connection';

const GuildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    ownerId: {
        type: String,
        required: true
    },
    config: {
        hosting: {
            type: String,
            enum: ['tickit', 'self'],
            default: 'tickit'
        },
        supportRoles: [String],
        categoryId: String,
        ticketPrefix: {
            type: String,
            default: 'ticket-'
        },
        welcomeMessage: String,
        ticketTimeout: {
            type: Number,
            default: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        },
        allowAttachments: {
            type: Boolean,
            default: true
        },
        // Self-hosting configuration
        selfHosting: {
            mongoUri: String,
            username: String,
            password: String,
        }
    },
    stats: {
        totalTickets: {
            type: Number,
            default: 0
        },
        openTickets: {
            type: Number,
            default: 0
        },
        resolvedTickets: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default async function getGuildModel() {
    const connection = await getMainConnection();
    return connection.model('Guild', GuildSchema);
}
