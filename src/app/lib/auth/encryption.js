import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const ENCRYPTION_IV = process.env.ENCRYPTION_IV; // 16 bytes

// Encrypt data for storing sensitive information
export function encrypt(text) {
    const iv = Buffer.from(ENCRYPTION_IV, 'hex');
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
}

// Decrypt data
export function decrypt(encrypted) {
    try {
        const iv = Buffer.from(ENCRYPTION_IV, 'hex');
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

// Hash passwords or other sensitive data
export function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
