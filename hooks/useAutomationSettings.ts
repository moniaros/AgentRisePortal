import { useOfflineSync } from './useOfflineSync';
import { AutomationChannelSettings } from '../types';

const fetchAutomationSettings = async (): Promise<AutomationChannelSettings> => {
    try {
        const response = await fetch(`/data/settings/automation.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch automation.json`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching automation settings:", error);
        // Return a default structure on error to prevent crashes
        return {
            email: { isEnabled: false },
            viber: { isEnabled: false },
            whatsapp: { isEnabled: false },
            sms: { isEnabled: false },
        };
    }
};

export const useAutomationSettings = () => {
    const {
        data: settings,
        isLoading,
        error,
        updateData: setSettings,
    } = useOfflineSync<AutomationChannelSettings>('automation_settings_data', fetchAutomationSettings, {
        email: { isEnabled: false },
        viber: { isEnabled: false },
        whatsapp: { isEnabled: false },
        sms: { isEnabled: false },
    });

    return {
        settings,
        isLoading,
        error,
        updateSettings: setSettings,
    };
};
