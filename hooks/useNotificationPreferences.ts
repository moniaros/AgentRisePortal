import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'notification_preferences_enabled';

export const useNotificationPreferences = () => {
    const [isEnabled, setIsEnabled] = useState<boolean>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : false;
        } catch {
            return false;
        }
    });

    const setEnabled = useCallback((enabled: boolean) => {
        setIsEnabled(enabled);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
        } catch (error) {
            console.error("Failed to save notification preferences to storage", error);
        }
    }, []);

    return { isEnabled, setEnabled };
};
