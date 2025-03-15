import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export function generateGuildToken(guildId) {
    return generateToken({ guildId, type: 'guild' });
}

export function generateUserToken(userId, guildIds = []) {
    return generateToken({ userId, guildIds, type: 'user' });
}
