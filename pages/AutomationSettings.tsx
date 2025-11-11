import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLocalization } from '../hooks/useLocalization';
import { useAutomationSettings } from '../hooks/useAutomationSettings';
import { AutomationChannelSettings } from '../types';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useNotification } from '../hooks/useNotification';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';
type ChannelKey = keyof AutomationChannelSettings;

const AutomationSettings: React.FC = () => {
    const { t } = useLocalization();
    const { settings, isLoading, error, updateSettings } = useAutomationSettings();
    const { addNotification } = useNotification();
    const [testStatuses, setTestStatuses] = useState<Record<ChannelKey, TestStatus>>({
        email: 'idle',
        sms: 'idle',
        viber: 'idle',
        whatsapp: 'idle',
    });

    const { register, handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<AutomationChannelSettings>({
        defaultValues: settings,
    });

    useEffect(() => {
        if (settings) {
            reset(settings);
        }
    }, [settings, reset]);

    const onSubmit = (data: AutomationChannelSettings) => {
        updateSettings(data);
        addNotification('Settings saved successfully!', 'success');
        reset(data); // Resets the dirty state
    };

    const handleTestConnection = (channel: ChannelKey) => {
        setTestStatuses(prev => ({ ...prev, [channel]: 'testing' }));
        // Simulate API call
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% chance of success
            setTestStatuses(prev => ({ ...prev, [channel]: success ? 'success' : 'error' }));
            setTimeout(() => setTestStatuses(prev => ({ ...prev, [channel]: 'idle' })), 3000);
        }, 1500);
    };

    const renderTestButton = (channel: ChannelKey) => {
        const status = testStatuses[channel];
        switch (status) {
            case 'testing':
                return <span className="text-sm text-blue-500">{t('automationRules.settings.testingConnection')}</span>;
            case 'success':
                return <span className="text-sm text-green-500">{t('automationRules.settings.connectionSuccess')}</span>;
            case 'error':
                return <span className="text-sm text-red-500">{t('automationRules.settings.connectionFailed')}</span>;
            default:
                return (
                    <button type="button" onClick={() => handleTestConnection(channel)} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">
                        {t('automationRules.settings.testButton')}
                    </button>
                );
        }
    };

    if (isLoading) {
        return <SkeletonLoader className="h-96 w-full" />;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }
    
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">{t('automationRules.settings.title')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">{t('automationRules.settings.description')}</p>
            </div>

            {/* Email Settings */}
            <ChannelSettingsCard title={t('automationRules.settings.channels.email.title')}>
                <Controller name="email.isEnabled" control={control} render={({ field }) => <ToggleSwitch id="email-enabled" {...field} checked={field.value} />} />
                <InputField label={t('automationRules.settings.channels.email.host')} {...register('email.host')} />
                <InputField label={t('automationRules.settings.channels.email.port')} {...register('email.port', { valueAsNumber: true })} type="number" />
                <InputField label={t('automationRules.settings.channels.email.username')} {...register('email.username')} />
                <InputField label={t('automationRules.settings.channels.email.password')} {...register('email.password')} type="password" />
                <InputField label={t('automationRules.settings.channels.email.fromAddress')} {...register('email.fromAddress')} type="email" />
                <div className="pt-2">{renderTestButton('email')}</div>
            </ChannelSettingsCard>

            {/* Viber Settings */}
            <ChannelSettingsCard title={t('automationRules.settings.channels.viber.title')}>
                <Controller name="viber.isEnabled" control={control} render={({ field }) => <ToggleSwitch id="viber-enabled" {...field} checked={field.value} />} />
                <InputField label={t('automationRules.settings.channels.viber.apiKey')} {...register('viber.apiKey')} type="password" />
                <InputField label={t('automationRules.settings.channels.viber.senderName')} {...register('viber.senderName')} />
                <div className="pt-2">{renderTestButton('viber')}</div>
            </ChannelSettingsCard>
            
            {/* WhatsApp Settings */}
            <ChannelSettingsCard title={t('automationRules.settings.channels.whatsapp.title')}>
                <Controller name="whatsapp.isEnabled" control={control} render={({ field }) => <ToggleSwitch id="whatsapp-enabled" {...field} checked={field.value} />} />
                <InputField label={t('automationRules.settings.channels.whatsapp.apiKey')} {...register('whatsapp.apiKey')} type="password" />
                <InputField label={t('automationRules.settings.channels.whatsapp.phoneNumberId')} {...register('whatsapp.phoneNumberId')} />
                <div className="pt-2">{renderTestButton('whatsapp')}</div>
            </ChannelSettingsCard>

            {/* SMS Settings */}
            <ChannelSettingsCard title={t('automationRules.settings.channels.sms.title')}>
                <Controller name="sms.isEnabled" control={control} render={({ field }) => <ToggleSwitch id="sms-enabled" {...field} checked={field.value} />} />
                <InputField label={t('automationRules.settings.channels.sms.apiKey')} {...register('sms.apiKey')} type="password" />
                <InputField label={t('automationRules.settings.channels.sms.apiSecret')} {...register('sms.apiSecret')} type="password" />
                <InputField label={t('automationRules.settings.channels.sms.senderId')} {...register('sms.senderId')} />
                <div className="pt-2">{renderTestButton('sms')}</div>
            </ChannelSettingsCard>
            
             <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                <button type="submit" disabled={!isDirty} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {t('automationRules.settings.saveButton')}
                </button>
            </div>
        </form>
    );
};

// Reusable components for the form
const ChannelSettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const { t } = useLocalization();
    const childrenArray = React.Children.toArray(children);
    const toggle = childrenArray[0];
    const fields = childrenArray.slice(1);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold">{title}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('automationRules.settings.enableChannel')}</span>
                    {toggle}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields}
            </div>
        </div>
    );
};

const InputField = React.forwardRef<HTMLInputElement, { label: string } & React.InputHTMLAttributes<HTMLInputElement>>(({ label, ...props }, ref) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
            {...props}
            ref={ref}
            className="mt-1 w-full p-2 border rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 focus:outline-none sm:text-sm border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
));

export default AutomationSettings;
