import React from 'react';
import { MicrositeSettings } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface SiteSettingsEditorProps {
    settings: MicrositeSettings;
    onUpdate: (updatedSettings: MicrositeSettings) => void;
}

const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({ settings, onUpdate }) => {
    const { t } = useLocalization();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onUpdate({ ...settings, [e.target.name]: e.target.value });
    };

    return (
        <div className="mt-4 space-y-4">
             <h3 className="text-lg font-semibold">{t('micrositeBuilder.siteSettings')}</h3>
            <div>
                <label className="block text-sm font-medium">{t('micrositeBuilder.settings.companyName')}</label>
                <input
                    type="text"
                    name="companyName"
                    value={settings.companyName}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
             <div>
                <label className="block text-sm font-medium">{t('micrositeBuilder.settings.themeColor')}</label>
                <input
                    type="color"
                    name="themeColor"
                    value={settings.themeColor}
                    onChange={handleChange}
                    className="mt-1 w-full"
                />
            </div>
        </div>
    );
};

export default SiteSettingsEditor;
