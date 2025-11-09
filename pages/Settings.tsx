import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';

const Settings: React.FC = () => {
    const { t } = useLocalization();
    const [gtmId, setGtmId] = useState('');
    const [savedMessage, setSavedMessage] = useState('');
    const [socialConnections, setSocialConnections] = useState<{ [key: string]: boolean }>({});

    // GTM Logic
    useEffect(() => {
        const storedGtmId = localStorage.getItem('gtmContainerId');
        if (storedGtmId) {
            setGtmId(storedGtmId);
        }
        const storedConnections = localStorage.getItem('socialConnections');
        if (storedConnections) {
            setSocialConnections(JSON.parse(storedConnections));
        }
    }, []);

    const handleSaveGtmId = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('gtmContainerId', gtmId.trim());
        setSavedMessage(t('settings.gtmSavedSuccess'));
        setTimeout(() => window.location.reload(), 1500); // Give user time to read the message
    };

    // Social Connections Logic
    const socialPlatforms = ['Facebook', 'Instagram', 'LinkedIn', 'X'];

    const handleSocialConnect = (platform: string) => {
        // Simulate OAuth flow
        alert(`Redirecting to ${platform} for authentication... (This is a simulation)`);
        setTimeout(() => {
            const updatedConnections = { ...socialConnections, [platform]: true };
            setSocialConnections(updatedConnections);
            localStorage.setItem('socialConnections', JSON.stringify(updatedConnections));
        }, 1000);
    };

    const handleSocialDisconnect = (platform: string) => {
        const updatedConnections = { ...socialConnections, [platform]: false };
        setSocialConnections(updatedConnections);
        localStorage.setItem('socialConnections', JSON.stringify(updatedConnections));
    };


    const Toggle = ({ label, enabled }: { label: string, enabled: boolean }) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300">{label}</span>
            <div className={`relative inline-block w-12 h-6 rounded-full transition-colors duration-300 ${enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-6' : ''}`}></span>
            </div>
        </div>
    );

    // Fix: Define a props interface and use React.FC to correctly type the component, allowing the 'key' prop.
    interface SocialConnectionCardProps {
        platform: string;
    }

    const SocialConnectionCard: React.FC<SocialConnectionCardProps> = ({ platform }) => {
        const isConnected = socialConnections[platform];
        const platformKey = platform.toLowerCase();
        
        return (
             <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                    <h4 className="font-semibold">{platform}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t(`settings.socialConnections.${platformKey}Desc`)}</p>
                </div>
                {isConnected ? (
                    <button onClick={() => handleSocialDisconnect(platform)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                        {t('settings.socialConnections.disconnect')}
                    </button>
                ) : (
                    <button onClick={() => handleSocialConnect(platform)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                        {t('settings.socialConnections.connect')}
                    </button>
                )}
            </div>
        )
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('header.settings')}</h1>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto space-y-8">
                {/* Social Media Connections */}
                <div>
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2 mb-4">{t('settings.socialConnections.title')}</h2>
                    <div className="space-y-4">
                        {socialPlatforms.map(platform => <SocialConnectionCard key={platform} platform={platform} />)}
                    </div>
                </div>

                {/* Notifications Section */}
                <div>
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2 mb-4">{t('settings.notifications')}</h2>
                    <div className="space-y-2">
                        <Toggle label={t('settings.emailNotifications')} enabled={true} />
                        <Toggle label={t('settings.pushNotifications')} enabled={false} />
                        <Toggle label={t('settings.monthlyReports')} enabled={true} />
                    </div>
                </div>

                {/* Appearance Section */}
                 <div>
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2 mb-4">{t('settings.appearance')}</h2>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.appearanceDesc')}</p>
                     <div className="flex items-center space-x-4">
                        <button className="flex-1 p-4 border-2 border-blue-500 rounded-lg text-center">
                            <span role="img" aria-label="sun" className="text-2xl">☀️</span>
                            <p>{t('settings.lightMode')}</p>
                        </button>
                         <button className="flex-1 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-center opacity-50">
                            <span role="img" aria-label="moon" className="text-2xl">🌙</span>
                            <p>{t('settings.darkMode')}</p>
                        </button>
                     </div>
                </div>

                {/* Integrations Section */}
                <div>
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2 mb-4">{t('settings.integrations')}</h2>
                    <form onSubmit={handleSaveGtmId} className="space-y-4">
                        <div>
                            <label htmlFor="gtm-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('settings.gtmId')}
                            </label>
                            <input
                                id="gtm-id"
                                type="text"
                                value={gtmId}
                                onChange={(e) => setGtmId(e.target.value)}
                                placeholder={t('settings.gtmPlaceholder')}
                                className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('settings.gtmDescription')}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                                {t('settings.saveGtmId')}
                            </button>
                            {savedMessage && <span className="text-sm text-green-600 dark:text-green-400">{savedMessage}</span>}
                        </div>
                    </form>
                </div>

                {/* Account Section */}
                <div>
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2 mb-4">{t('settings.account')}</h2>
                    <div className="space-y-4">
                        <button className="w-full text-left p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition">
                            {t('settings.changePassword')}
                        </button>
                         <button className="w-full text-left p-3 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 rounded-md transition font-semibold">
                            {t('settings.deleteAccount')}
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
