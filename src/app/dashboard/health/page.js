'use client';

import { useState, useEffect } from 'react';

export default function HealthDashboard() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [reconnecting, setReconnecting] = useState(false);

    useEffect(() => {
        async function fetchHealth() {
            try {
                setLoading(true);
                const response = await fetch('/api/health'); // This points to the API endpoint

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setHealth(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchHealth();
    }, [refreshKey]);

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const handleReconnect = async () => {
        setReconnecting(true);
        try {
            const response = await fetch('/api/reconnect', { method: 'POST' }); // Call the reconnect API

            if (!response.ok) {
                throw new Error(`Failed to reconnect. Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setRefreshKey((prev) => prev + 1); // Refresh health data
            } else {
                throw new Error(data.message || 'Failed to reconnect.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setReconnecting(false);
        }
    };

    if (loading && !health) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
                <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">System Health</h1>
                    <div className="flex justify-center">
                        <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-4 py-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">System Health</h1>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Refresh
                    </button>
                </div>

                {error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                ) : null}

                {health ? (
                    <div className="space-y-6">
                        <div className="flex items-center p-4 bg-gray-50 border rounded-lg">
                            <div className="mr-4">
                                <div
                                    className={`h-3 w-3 rounded-full ${
                                        health.services.database === 'connected'
                                            ? 'bg-green-500'
                                            : health.services.database === 'disconnected'
                                                ? 'bg-red-500'
                                                : health.services.database === 'connecting'
                                                    ? 'bg-yellow-500'
                                                    : health.services.database === 'disconnecting'
                                                        ? 'bg-orange-500'
                                                        : 'bg-gray-500'
                                    }`}
                                ></div>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">
                                    System Status:{' '}
                                    <span
                                        className={
                                            health.services.database === 'connected'
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }
                                    >
                                        {health.services.database === 'connected'
                                            ? 'Healthy'
                                            : 'Unhealthy'}
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Last updated: {new Date(health.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {health.services.database === 'disconnected' && (
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={handleReconnect}
                                    disabled={reconnecting}
                                    className={`px-4 py-2 ${
                                        reconnecting ? 'bg-gray-400' : 'bg-red-500'
                                    } text-white rounded hover:bg-red-600 transition-colors`}
                                >
                                    {reconnecting ? 'Reconnecting...' : 'Reconnect to Database'}
                                </button>
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Services</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded border">
                                    <div className="flex items-center">
                                        <div
                                            className={`h-2 w-2 rounded-full ${
                                                health.services.api === 'online'
                                                    ? 'bg-green-500'
                                                    : 'bg-red-500'
                                            } mr-2`}
                                        ></div>
                                        <span className="font-medium">API</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{health.services.api}</p>
                                </div>

                                <div className="p-3 bg-gray-50 rounded border">
                                    <div className="flex items-center">
                                        <div
                                            className={`h-2 w-2 rounded-full ${
                                                health.services.database === 'connected'
                                                    ? 'bg-green-500'
                                                    : health.services.database === 'disconnected'
                                                        ? 'bg-red-500'
                                                        : health.services.database === 'connecting'
                                                            ? 'bg-yellow-500'
                                                            : health.services.database === 'disconnecting'
                                                                ? 'bg-orange-500'
                                                                : 'bg-gray-500'
                                            } mr-2`}
                                        ></div>
                                        <span className="font-medium">Database</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{health.services.database}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
