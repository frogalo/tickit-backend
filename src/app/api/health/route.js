import { NextResponse } from 'next/server';
import { getMainConnection } from '../../lib/mongodb/connection';
import { createLogger } from '../../lib/utils/logger';

const logger = createLogger('HealthAPI');
import { connectToDatabase } from '../../lib/mongodb/connection';


export async function POST() {
    try {
        await connectToDatabase('main'); // Attempt to reconnect to the main database
        return new Response(
            JSON.stringify({ success: true, message: 'Reconnected to the database successfully.' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, message: 'Failed to reconnect to the database.', error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function GET() {
    try {
        // Check MongoDB connection
        let dbStatus = 'disconnected';
        let dbDetails = null;

        try {
            const connection = await getMainConnection();
            const connectionState = connection.readyState;

            // MongoDB connection states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
            const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
            dbStatus = states[connectionState] || 'unknown';

            if (connectionState === 1) {
                // Only fetch details if connected
                dbDetails = {
                    host: connection.host,
                    name: connection.name,
                    models: Object.keys(connection.models || {})
                };
            }
        } catch (dbError) {
            logger.error('Database health check error:', dbError);
        }

        // Check system resources
        const memoryUsage = process.memoryUsage();

        const healthData = {
            status: dbStatus === 'connected' ? 'ok' : 'error', // Change status based on DB connection
            version: '0.0.1',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            services: {
                api: 'online',
                database: dbStatus,
                memory: {
                    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
                }
            }
        };

        // Add DB details if available
        if (dbDetails) {
            healthData.services.databaseDetails = dbDetails;
        }

        return NextResponse.json(healthData);
    } catch (error) {
        logger.error('Health check error:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Health check failed',
            error: error.message
        }, { status: 500 });
    }
}
