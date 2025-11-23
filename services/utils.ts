
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

/**
 * Converts a File object to a Base64 string (without data URI prefix).
 * @param file The file to convert
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};
