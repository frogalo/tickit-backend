'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VersionHistory() {
    const [versionHistory, setVersionHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch version history from the JSON file
    useEffect(() => {
        async function fetchVersionHistory() {
            try {
                const response = await fetch('/versionHistory.json'); // Fetch the JSON file from the public directory
                if (!response.ok) {
                    throw new Error(`Failed to fetch version history. Status: ${response.status}`);
                }
                const data = await response.json();
                setVersionHistory(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchVersionHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Version History</h1>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Version History</h1>
                    <p className="text-red-600">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Version History</h1>
                <ul className="space-y-4">
                    {versionHistory.map((version) => (
                        <li key={version.version} className="p-4 bg-gray-100 rounded shadow">
                            <h2 className="text-xl font-semibold mb-2">Version {version.version}</h2>
                            <ul className="list-disc pl-6">
                                {version.changes.map((change, index) => (
                                    <li key={index} className="text-gray-700">
                                        {change}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
                <div className="flex justify-center mt-6">
                    <Link href="/" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
