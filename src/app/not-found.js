import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    The page you are looking for might have been removed or is temporarily unavailable.
                </p>
                <Link
                    href="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Go to Home
                </Link>
            </div>
        </div>
    );
}