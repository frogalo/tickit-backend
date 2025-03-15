import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    Tickit Backend
                </h1>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <p className="text-gray-700">
                        API service for Discord ticket management system
                    </p>
                </div>
                <div className="flex justify-between mt-8">
                    <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm text-gray-600">System Online</span>
                    </div>
                    <Link
                        href="/dashboard/health"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                        System Health Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
