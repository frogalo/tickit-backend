import { NextResponse } from 'next/server';
import getGuildModel from '@/lib/mongodb/models/Guild';
import { encrypt, decrypt } from '@/lib/auth/encryption';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('GuildConfig');

// Get guild configuration
export async function GET(request, { params }) {
    try {
        const { guildId } = params;
        const GuildModel = await getGuildModel();

        const guild = await GuildModel.findOne({ guildId });

        if (!guild) {
            return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
        }

        // Handle encrypted sensitive data if needed
        const config = { ...guild.config };

        // If self-hosting, decrypt password if it exists
        if (config.hosting === 'self' && config.selfHosting?.password) {
            config.selfHosting = {
                ...config.selfHosting,
                password: '●●●●●●●●' // Don't send actual password, just indicate it exists
            };
        }

        return NextResponse.json({
            guildId: guild.guildId,
            name: guild.name,
            config,
            stats: guild.stats
        });
    } catch (error) {
        logger.error('Error getting guild config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Update guild configuration
export async function PUT(request, { params }) {
    try {
        const { guildId } = params;
        const body = await request.json();
        const GuildModel = await getGuildModel();

        // Validate input
        if (!body.config) {
            return NextResponse.json({ error: 'Config object is required' }, { status: 400 });
        }

        // Find the guild
        let guild = await GuildModel.findOne({ guildId });

        if (!guild) {
            return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
        }

        // Handle encryption for sensitive data
        const updatedConfig = { ...body.config };

        // If self-hosting and password is provided, encrypt it
        if (updatedConfig.hosting === 'self' &&
            updatedConfig.selfHosting &&
            updatedConfig.selfHosting.password &&
            updatedConfig.selfHosting.password !== '●●●●●●●●') {
            updatedConfig.selfHosting = {
                ...updatedConfig.selfHosting,
                password: encrypt(updatedConfig.selfHosting.password)
            };
        } else if (updatedConfig.hosting === 'self' &&
            updatedConfig.selfHosting &&
            updatedConfig.selfHosting.password === '●●●●●●●●') {
            // If password is masked, keep the existing password
            delete updatedConfig.selfHosting.password;
        }

        // Update the guild configuration
        guild = await GuildModel.findOneAndUpdate(
            { guildId },
            { $set: { config: updatedConfig } },
            { new: true }
        );

        return NextResponse.json({
            guildId: guild.guildId,
            name: guild.name,
            config: updatedConfig,
            stats: guild.stats
        });
    } catch (error) {
        logger.error('Error updating guild config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
