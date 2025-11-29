
import { useOfflineSync } from './useOfflineSync';
import { AutomationChannelSettings } from '../types';
import { fetchAutomationSettings } from '../services/api';

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
