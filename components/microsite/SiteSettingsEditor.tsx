import React from 'react';
import { MicrositeConfig } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface SiteSettingsEditorProps {
    config: MicrositeConfig;
    onUpdate: (updatedConfig: MicrositeConfig) => void;
}

const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({ config, onUpdate }) => {
    const { t } = useLocalization();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('social.')) {
            const socialKey = name.split('.')[1] as keyof MicrositeConfig['social'];
            onUpdate({
                ...config,
                social: { ...config.social, [socialKey]: value }
            });
        } else {
            onUpdate({ ...config, [name]: value });
        }
    };

    const LabeledInput: React.FC<{ label: string; name: string; value: string; type?: string }> = ({ label, name, value, type = 'text' }) => (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('micrositeBuilder.siteSettings')}</h3>
            <LabeledInput label={t('micrositeBuilder.settings.siteTitle')} name="siteTitle" value={config.siteTitle} />
            <LabeledInput label={t('micrositeBuilder.settings.themeColor')} name="themeColor" value={config.themeColor} type="color" />
            <LabeledInput label={t('micrositeBuilder.settings.contactEmail')} name="contactEmail" value={config.contactEmail} type="email" />
            <LabeledInput label={t('micrositeBuilder.settings.contactPhone')} name="contactPhone" value={config.contactPhone} type="tel" />
            <LabeledInput label={t('micrositeBuilder.settings.address')} name="address" value={config.address} />
            <h4 className="font-semibold pt-2">{t('header.socials')}</h4>
            <LabeledInput label={t('micrositeBuilder.settings.facebookUrl')} name="social.facebook" value={config.social.facebook} />
            <LabeledInput label={t('micrositeBuilder.settings.linkedinUrl')} name="social.linkedin" value={config.social.linkedin} />
            <LabeledInput label={t('micrositeBuilder.settings.xUrl')} name="social.x" value={config.social.x} />
        </div>
    );
};

export default SiteSettingsEditor;