import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {createLogger} from '../utils/logger';

const logger = createLogger('MongoDB');
const connections = new Map();

// For testing purposes
let mongoMemoryServer;

export async function connectToDatabase(databaseName = 'main') {
    // Check if we already have this connection
    if (connections.has(databaseName)) {
        return connections.get(databaseName);
    }

    try {
        const uri = process.env.NODE_ENV === 'test'
            ? (mongoMemoryServer ? mongoMemoryServer.getUri() : await createMemoryServer())
            : process.env.MONGODB_URI;

        const dbName = databaseName === 'main' ? 'tickit' : `tickit-guild-${databaseName}`;
        const connection = mongoose.createConnection(`${uri}/${dbName}`);

        connection.on('error', (err) => {
            logger.error(`MongoDB connection error for ${databaseName}:`, err);
        });

        connection.once('open', () => {
            logger.info(`Connected to MongoDB database: ${databaseName}`);
        });

        // Store the connection
        connections.set(databaseName, connection);
        return connection;
    } catch (error) {
        logger.error(`Error connecting to database ${databaseName}:`, error);
        throw error;
    }
}

export async function closeAllConnections() {
    for (const [name, connection] of connections.entries()) {
        await connection.close();
        logger.info(`Closed connection to ${name}`);
    }
    connections.clear();

    if (mongoMemoryServer) {
        await mongoMemoryServer.stop();
        mongoMemoryServer = null;
    }
}

async function createMemoryServer() {
    mongoMemoryServer = await MongoMemoryServer.create();
    return mongoMemoryServer.getUri();
}

// Get models for a specific guild
export async function getGuildModels(guildId) {
    const connection = await connectToDatabase(guildId);

    return {
        Ticket: getTicketModel(connection),
        // Add other guild-specific models here
    };
}

// Main connection for central data
export async function getMainConnection() {
    return connectToDatabase('main');
}

// Model creators
function getTicketModel(connection) {
    const {Schema} = mongoose;

    const TicketSchema = new Schema({
        ticketId: {type: String, required: true, unique: true},
        createdBy: {type: String, required: true},
        subject: {type: String, required: true},
        status: {
            type: String,
            enum: ['open', 'closed', 'archived'],
            default: 'open'
        },
        messages: [{
            authorId: {type: String, required: true},
            content: {type: String, required: true},
            timestamp: {type: Date, default: Date.now}
        }],
        createdAt: {type: Date, default: Date.now},
        closedAt: {type: Date},
    }, {timestamps: true});

    return connection.model('Ticket', TicketSchema);
}
