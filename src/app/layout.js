import { Inter } from 'next/font/google';
import './globals.css';
import { initializeQueueSystem } from './lib/queue/simpleQueue';
import { initializeQueueProcessors } from './lib/queue/processingJobs';

const inter = Inter({ subsets: ['latin'] });

// Initialize services on server start
let initialized = false;

if (typeof window === 'undefined' && !initialized) {
    try {
        initializeQueueSystem();
        initializeQueueProcessors();
        console.log('Initialized Tickit Backend services');
        initialized = true;
    } catch (error) {
        console.error('Failed to initialize services:', error);
    }
}

export const metadata = {
    title: 'Tickit Backend',
    description: 'Backend service for Discord ticketing system',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={inter.className}>{children}</body>
        </html>
    );
}
