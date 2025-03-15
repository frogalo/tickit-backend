export function createLogger(module) {
    return {
        info: (message, ...args) => {
            console.log(`[INFO][${module}] ${message}`, ...args);
        },
        error: (message, ...args) => {
            console.error(`[ERROR][${module}] ${message}`, ...args);
        },
        warn: (message, ...args) => {
            console.warn(`[WARN][${module}] ${message}`, ...args);
        }
    };
}