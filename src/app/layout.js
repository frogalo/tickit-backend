import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { initializeQueueSystem } from './lib/queue/simpleQueue';
import { initializeQueueProcessors } from './lib/queue/processingJobs';

// Load the Inter font from Google Fonts
const inter = Inter({ subsets: ['latin'] });

// Initialize services on server start
let initialized = false;

if (typeof window === 'undefined' && !initialized) {
    try {
        // Initialize the queue system and processors for background tasks
        initializeQueueSystem();
        initializeQueueProcessors();
        console.log('Initialized Tickit Backend services');
        initialized = true;
    } catch (error) {
        console.error('Failed to initialize services:', error);
    }
}

// Metadata for the app (used for SEO and browser titles)
export const metadata = {
    title: 'Tickit Backend',
    description: 'Backend service for Discord ticketing system',
};

// Root layout component for the app
export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
                {/* Clickable and Larger "Tickit" */}
                <Link href="/" className="text-3xl font-bold mb-6 hover:text-blue-400 transition-colors">
                    Tickit
                </Link>
                <nav className="space-y-2">
                    <Link
                        href="/version-history"
                        className="block px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors text-center"
                    >
                        Version History
                    </Link>
                    <Link
                        href="/health"
                        className="block px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors text-center"
                    >
                        Service Status
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 bg-gray-50">{children}</main>
        </div>
        </body>
        </html>
    );
}
