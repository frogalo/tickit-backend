import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

export function middleware(request) {
    // Path information
    const { pathname } = request.nextUrl;

    // Skip middleware for non-API routes or public API routes
    if (!pathname.startsWith('/api') ||
        pathname.startsWith('/api/health') ||
        pathname.startsWith('/api/auth/login') ||
        pathname.startsWith('/api/auth/register')) {
        return NextResponse.next();
    }

    // Check for authentication
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new NextResponse(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { 'content-type': 'application/json' } }
        );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
        return new NextResponse(
            JSON.stringify({ error: 'Invalid or expired token' }),
            { status: 401, headers: { 'content-type': 'application/json' } }
        );
    }

    // For guild-specific routes, check if the user has access to the guild
    if (pathname.includes('/api/guilds/')) {
        const guildIdMatch = pathname.match(/\/api\/guilds\/([^\/]+)/);

        if (guildIdMatch && guildIdMatch[1]) {
            const requestedGuildId = guildIdMatch[1];

            // If it's a user token, check if they have access to this guild
            if (payload.type === 'user' && !payload.guildIds.includes(requestedGuildId)) {
                return new NextResponse(
                    JSON.stringify({ error: 'Unauthorized access to this guild' }),
                    { status: 403, headers: { 'content-type': 'application/json' } }
                );
            }

            // If it's a guild token, check if it's for the correct guild
            if (payload.type === 'guild' && payload.guildId !== requestedGuildId) {
                return new NextResponse(
                    JSON.stringify({ error: 'Invalid guild token' }),
                    { status: 403, headers: { 'content-type': 'application/json' } }
                );
            }
        }
    }

    // Continue with the valid request
    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
