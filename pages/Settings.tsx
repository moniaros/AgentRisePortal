import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { SocialPlatform } from '../types';
import SocialAuthModal from '../components/settings/SocialAuthModal';

// Placeholder icons - in a real app, these would be proper SVG components
const FacebookIcon = () => <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.41 0 22.675 0z" /></svg>;
const InstagramIcon = () => <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85c.148-3.225 1.664-4.771 4.919-4.919 1.266-.058 1.644-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98C15.667 0 15.259 0 12 0z" /><path d="M12 6.848c-2.832 0-5.152 2.32-5.152 5.152s2.32 5.152 5.152 5.152 5.152-2.32 5.152-5.152-2.32-5.152-5.152-5.152zm0 8.302c-1.743 0-3.15-1.407-3.15-3.15s1.407-3.15 3.15-3.15 3.15 1.407 3.15 3.15-1.407 3.15-3.15 3.15z" /><path d="M16.949 5.255a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" /></svg>;
const LinkedInIcon = () => <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
const XIcon = () => <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;

const socialPlatforms: SocialPlatform[] = [
    { key: 'facebook', name: 'Facebook', icon: <FacebookIcon /> },
    { key: 'instagram', name: 'Instagram', icon: <InstagramIcon /> },
    { key: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon /> },
    { key: 'x', name: 'X', icon: <XIcon /> },
];

const Settings: React.FC = () => {
    const { t } = useLocalization();
    const [gtmId, setGtmId] = useState('');
    const [savedMessage, setSavedMessage] = useState('');
    const [connections, setConnections] = useState<{ [key: string]: boolean }>({});
    const [authPlatform, setAuthPlatform] = useState<SocialPlatform | null>(null);

    useEffect(() => {
        const storedGtmId = localStorage.getItem('gtmContainerId');
        if (storedGtmId) setGtmId(storedGtmId);

        const storedConnections = localStorage.getItem('socialConnections');
        if (storedConnections) setConnections(JSON.parse(storedConnections));
    }, []);

    const handleSaveGtmId = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('gtmContainerId', gtmId.trim());
        setSavedMessage(t('settings.gtmSavedSuccess'));
        setTimeout(() => window.location.reload(), 1500);
    };

    const updateConnections = (updated: { [key: string]: boolean }) => {
        setConnections(updated);
        localStorage.setItem('socialConnections', JSON.stringify(updated));
    };
    
    const handleAuthSuccess = (platformKey: string) => {
        const mockToken = `${platformKey}_token_${Date.now()}`;
        localStorage.setItem(`${platformKey}_token`, mockToken);
        updateConnections({ ...connections, [platformKey]: true });
        setAuthPlatform(null);
    };
    
    const handleDisconnect = (platformKey: string) => {
        localStorage.removeItem(`${platformKey}_token`);
        updateConnections({ ...connections, [platformKey]: false });
    };

    const Toggle = ({ label, enabled }: { label: string, enabled: boolean }) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300">{label}</span>
            <div className={`relative inline-block w-12 h-6 rounded-full transition-colors duration-300 ${enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-6' : ''}`}></span>
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('header.settings')}</h1>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-2xl mx-auto space-y-8">
                <div>
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2 mb-4">{t('settings.socialConnections.title')}</h2>
                    <div className="space-y-4">
                        {socialPlatforms.map(platform => {
                            const isConnected = !!connections[platform.key];
                            return (
                                <div key={platform.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        {platform.icon}
                                        <div>
                                            <h4 className="font-semibold">{platform.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{t(`settings.socialConnections.platforms.${platform.key}.description`)}</p>
                                        </div>
                                    </div>
                                    {isConnected ? (
                                        <button onClick={() => handleDisconnect(platform.key)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                                            {t('settings.socialConnections.disconnect')}
                                        </button>
                                    ) : (
                                        <button onClick={() => setAuthPlatform(platform)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                                            {t('settings.socialConnections.connect')}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Other sections remain unchanged... */}
                 <div>
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2 mb-4">{t('settings.notifications')}</h2>
                    <div className="space-y-2">
                        <Toggle label={t('settings.emailNotifications')} enabled={true} />
                        <Toggle label={t('settings.pushNotifications')} enabled={false} />
                        <Toggle label={t('settings.monthlyReports')} enabled={true} />
                    </div>
                </div>
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

            {authPlatform && (
                <SocialAuthModal
                    platform={authPlatform}
                    onClose={() => setAuthPlatform(null)}
                    onSuccess={handleAuthSuccess}
                />
            )}
        </div>
    );
};

export default Settings;
