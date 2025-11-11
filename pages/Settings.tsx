import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { SOCIAL_PLATFORMS, ICONS } from '../constants';
import { SocialPlatform } from '../types';
import SocialAuthModal from '../components/settings/SocialAuthModal';

const Settings: React.FC = () => {
    const { t } = useLocalization();
    const [connectedAccounts, setConnectedAccounts] = useState<Set<string>>(() => new Set(['facebook']));
    const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
    const [gtmId, setGtmId] = useState(() => localStorage.getItem('gtmContainerId') || '');

    const handleConnect = (platform: SocialPlatform) => {
        setSelectedPlatform(platform);
    };

    const handleDisconnect = (platformKey: string) => {
        setConnectedAccounts(prev => {
            const newSet = new Set(prev);
            newSet.delete(platformKey);
            return newSet;
        });
    };
    
    const handleAuthSuccess = (platformKey: string) => {
        setConnectedAccounts(prev => new Set(prev).add(platformKey));
        setSelectedPlatform(null);
    };

    const handleGtmSave = () => {
        localStorage.setItem('gtmContainerId', gtmId);
        alert('GTM ID saved. Please refresh the page for it to take effect.');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('settings.title') as string}</h1>

            {/* Automation Rules */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 text-blue-500">
                        {React.cloneElement(ICONS.automation, { className: 'w-8 h-8' })}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-2">{t('settings.automation.title')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.automation.description')}</p>
                        <Link to="/settings/automation-rules" className="inline-block px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            {t('settings.automation.manage')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Social Connections */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">{t('settings.socialConnections.title') as string}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('settings.socialConnections.description') as string}</p>
                <div className="space-y-4">
                    {SOCIAL_PLATFORMS.map(platform => (
                        <div key={platform.key} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-md">
                            <div className="flex items-center gap-4">
                                {platform.icon}
                                <span className="font-medium">{platform.name}</span>
                            </div>
                            {connectedAccounts.has(platform.key) ? (
                                <button onClick={() => handleDisconnect(platform.key)} className="px-4 py-1.5 text-sm bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-full hover:bg-red-200">
                                    {t('settings.socialConnections.disconnect') as string}
                                </button>
                            ) : (
                                <button onClick={() => handleConnect(platform)} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700">
                                    {t('settings.socialConnections.connect') as string}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* GTM Configuration */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-semibold mb-4">{t('settings.gtm.title') as string}</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('settings.gtm.description') as string}</p>
                 <div className="flex items-center gap-4">
                    <input 
                        type="text"
                        value={gtmId}
                        onChange={(e) => setGtmId(e.target.value)}
                        placeholder="GTM-XXXXXXX"
                        className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button onClick={handleGtmSave} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('crm.save') as string}
                    </button>
                 </div>
            </div>

            {selectedPlatform && (
                <SocialAuthModal 
                    platform={selectedPlatform}
                    onClose={() => setSelectedPlatform(null)}
                    onSuccess={handleAuthSuccess}
                />
            )}
        </div>
    );
};

export default Settings;