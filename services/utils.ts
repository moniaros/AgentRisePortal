
/**
 * Generates a unique ID (UUID v4 compliant-ish).
 * Used to simulate backend ID generation.
 */
export const generateId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Simulates network latency.
 * @param ms Delay in milliseconds (default 500ms)
 */
export const delay = (ms: number = 500): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
