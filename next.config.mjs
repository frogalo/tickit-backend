/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
                ],
            },
        ];
    },
    webpack: (config) => {
        // Allow importing environment variables in server components
        config.experiments = { ...config.experiments, topLevelAwait: true };
        return config;
    },
    // Use the new `serverExternalPackages` for external dependencies
    serverExternalPackages: ['mongoose'], // Add any other server-side packages here
    experimental: {
        turbo: {
            resolveAlias: {
                '@': './src', // Alias for the `src` directory
            },
            resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.json'], // Custom extensions
        },
    },
};

export default nextConfig;
