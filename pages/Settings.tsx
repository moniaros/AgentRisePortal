import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const Settings: React.FC = () => {
    const { t } = useLocalization();

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
                {/* Notifications Section */}
                <div>
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2 mb-4">Notifications</h2>
                    <div className="space-y-2">
                        <Toggle label="Email Notifications" enabled={true} />
                        <Toggle label="Push Notifications" enabled={false} />
                        <Toggle label="Monthly Reports" enabled={true} />
                    </div>
                </div>

                {/* Appearance Section */}
                 <div>
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2 mb-4">Appearance</h2>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Theme settings are currently managed by your browser preferences.</p>
                     <div className="flex items-center space-x-4">
                        <button className="flex-1 p-4 border-2 border-blue-500 rounded-lg text-center">
                            <span role="img" aria-label="sun" className="text-2xl">☀️</span>
                            <p>Light Mode</p>
                        </button>
                         <button className="flex-1 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-center opacity-50">
                            <span role="img" aria-label="moon" className="text-2xl">🌙</span>
                            <p>Dark Mode</p>
                        </button>
                     </div>
                </div>

                {/* Account Section */}
                <div>
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2 mb-4">Account</h2>
                    <div className="space-y-4">
                        <button className="w-full text-left p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition">
                            Change Password
                        </button>
                         <button className="w-full text-left p-3 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 rounded-md transition font-semibold">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;