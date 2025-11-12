
import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { IMPORTANT_NOTIFICATION_EVENTS, OPTIONAL_NOTIFICATION_EVENTS } from '../../constants/notificationEvents';
import ToggleSwitch from '../ui/ToggleSwitch';

interface NotificationEventSettingsProps {
    settings: Record<string, boolean>;
    updateSetting: (key: string, enabled: boolean) => void;
    masterEnabled: boolean;
}

const NotificationEventRow: React.FC<{ eventKey: string; isEnabled: boolean; onToggle: (checked: boolean) => void; masterEnabled: boolean; }> = ({ eventKey, isEnabled, onToggle, masterEnabled }) => {
    const { t } = useLocalization();
    const label = t(`settings.notifications.events.${eventKey}.label`);
    const description = t(`settings.notifications.events.${eventKey}.description`);

    return (
        <div className="flex justify-between items-center py-3">
            <div>
                <p className={`font-medium ${!masterEnabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{label}</p>
                <p className={`text-sm ${!masterEnabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>{description}</p>
            </div>
            <ToggleSwitch 
                id={`toggle-${eventKey}`}
                checked={isEnabled && masterEnabled}
                onChange={(e) => onToggle(e.target.checked)}
                disabled={!masterEnabled}
                aria-label={label}
            />
        </div>
    );
}

const NotificationEventSettings: React.FC<NotificationEventSettingsProps> = ({ settings, updateSetting, masterEnabled }) => {
    const { t } = useLocalization();

    return (
        <div className={`transition-opacity duration-300 ${masterEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="mt-6">
                <h4 className="font-semibold text-lg mb-2">{t('settings.notifications.eventGroups.important')}</h4>
                <div className="divide-y dark:divide-gray-700">
                    {IMPORTANT_NOTIFICATION_EVENTS.map(key => (
                        <NotificationEventRow 
                            key={key} 
                            eventKey={key} 
                            isEnabled={settings[key] ?? true}
                            onToggle={(checked) => updateSetting(key, checked)}
                            masterEnabled={masterEnabled}
                        />
                    ))}
                </div>
            </div>
            <div className="mt-6">
                <h4 className="font-semibold text-lg mb-2">{t('settings.notifications.eventGroups.optional')}</h4>
                 <div className="divide-y dark:divide-gray-700">
                    {OPTIONAL_NOTIFICATION_EVENTS.map(key => (
                        <NotificationEventRow 
                            key={key} 
                            eventKey={key} 
                            isEnabled={settings[key] ?? true}
                            onToggle={(checked) => updateSetting(key, checked)}
                            masterEnabled={masterEnabled}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationEventSettings;
