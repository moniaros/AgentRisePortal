
import { useState, useCallback } from 'react';
import { IMPORTANT_NOTIFICATION_EVENTS, OPTIONAL_NOTIFICATION_EVENTS } from '../constants/notificationEvents';

const STORAGE_KEY = 'individual_notification_settings';

const ALL_EVENTS = [...IMPORTANT_NOTIFICATION_EVENTS, ...OPTIONAL_NOTIFICATION_EVENTS];

// Initialize with all settings enabled by default
const getDefaultSettings = (): Record<string, boolean> => {
    return ALL_EVENTS.reduce((acc, eventKey) => {
        acc[eventKey] = true;
        return acc;
    }, {} as Record<string, boolean>);
};

export const useIndividualNotificationSettings = () => {
    const [settings, setSettings] = useState<Record<string, boolean>>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                // Merge with defaults to ensure new settings are included if added later
                return { ...getDefaultSettings(), ...JSON.parse(stored) };
            }
        } catch {
             console.error("Failed to parse individual notification settings from localStorage");
        }
        return getDefaultSettings();
    });

    const updateSetting = useCallback((key: string, enabled: boolean) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: enabled };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
            } catch (error) {
                console.error("Failed to save individual notification settings", error);
            }
            return newSettings;
        });
    }, []);

    return { settings, updateSetting };
};
