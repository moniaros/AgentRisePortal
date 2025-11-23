
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../hooks/useTheme';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { useSocialConnections } from '../hooks/useSocialConnections';
import SocialConnectionRow from '../components/settings/SocialConnectionRow';
import SocialAuthModal from '../components/settings/SocialAuthModal';
import { SOCIAL_PLATFORMS } from '../constants';
import { SocialPlatform } from '../types';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { requestNotificationPermission, showDemoNotification } from '../services/notificationService';
import { useIndividualNotificationSettings } from '../hooks/useIndividualNotificationSettings';
import PermissionDeniedWarning from '../components/settings/PermissionDeniedWarning';
import NotificationEventSettings from '../components/settings/NotificationEventSettings';

type SettingsTab = 'general' | 'security' | 'notifications' | 'integrations' | 'audit';

const Settings: React.FC = () => {
    const { t } = useLocalization();
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    
    // General Settings State
    const [clientId, setClientId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [timezone, setTimezone] = useState('Europe/Athens');
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

    // Integration State
    const [connectionStatus, setConnectionStatus] = useState(t('settings.integrations.statusNotConnected'));
    
    // Theme State
    const { theme, toggleTheme } = useTheme();

    // Social Connections State
    const { connections, connectPlatform, disconnectPlatform } = useSocialConnections();
    const [authModalPlatform, setAuthModalPlatform] = useState<SocialPlatform | null>(null);

    // Notification State
    const { isEnabled: isNotificationsEnabled, setEnabled: setNotificationsEnabled } = useNotificationPreferences();
    const { settings: individualSettings, updateSetting: updateIndividualSetting } = useIndividualNotificationSettings();
    const [permissionDenied, setPermissionDenied] = useState(Notification.permission === 'denied');


    useEffect(() => {
        const savedClientId = localStorage.getItem('google_client_id');
        const savedApiKey = localStorage.getItem('gemini_api_key');
        if (savedClientId) setClientId(savedClientId);
        if (savedApiKey) setApiKey(savedApiKey);

        const savedLocationTitle = localStorage.getItem('gbp_location_title');
        if (savedLocationTitle) {
            setConnectionStatus(t('settings.integrations.statusConnectedTo', { businessName: savedLocationTitle }));
        } else {
            setConnectionStatus(t('settings.integrations.statusNotConnected'));
        }

        // Periodically check for permission changes
        const interval = setInterval(() => {
            const currentPermission = Notification.permission;
            if (currentPermission === 'denied' && !permissionDenied) {
                setPermissionDenied(true);
                setNotificationsEnabled(false);
            }
            if (currentPermission !== 'denied' && permissionDenied) {
                setPermissionDenied(false);
            }
        }, 1000);
        return () => clearInterval(interval);

    }, [t, permissionDenied, setNotificationsEnabled]);

    const handleSaveKeys = () => {
        localStorage.setItem('google_client_id', clientId);
        localStorage.setItem('gemini_api_key', apiKey);
        addNotification(t('settings.setup.saveSuccess'), 'success');
    };

    const processGbpConnection = async () => {
        const gapi = (window as any).gapi;
        try {
            await gapi.client.load('mybusinessbusinessinformation', 'v1');
            setConnectionStatus(t('settings.integrations.statusFetchingProfiles'));
            const accountsResponse = await gapi.client.mybusinessbusinessinformation.accounts.list();
            const accounts = accountsResponse.result.accounts;

            if (!accounts || accounts.length === 0) {
                setConnectionStatus(t('settings.integrations.statusNoAccounts'));
                addNotification(t('settings.integrations.warningNoAccounts'), 'warning');
                return;
            }
            const firstAccount = accounts[0];

            setConnectionStatus(t('settings.integrations.statusFetchingLocations'));
            const locationsResponse = await gapi.client.mybusinessbusinessinformation.accounts.locations.list({
                parent: firstAccount.name,
                pageSize: 1,
                readMask: 'name,title'
            });
            const locations = locationsResponse.result.locations;

            if (!locations || locations.length === 0) {
                setConnectionStatus(t('settings.integrations.statusNoLocations'));
                addNotification(t('settings.integrations.warningNoLocations'), 'warning');
                return;
            }
            const firstLocation = locations[0];
            const businessName = firstLocation.title;
            const locationName = firstLocation.name;

            localStorage.setItem('gbp_location_name', locationName);
            localStorage.setItem('gbp_location_title', businessName);
            setConnectionStatus(t('settings.integrations.statusConnectedTo', { businessName }));
            addNotification(t('settings.integrations.successConnected', { businessName }), 'success');

            setTimeout(() => navigate('/'), 1500);

        } catch (error) {
            console.error('API Error:', error);
            setConnectionStatus(t('settings.integrations.statusApiError'));
            addNotification(t('settings.integrations.errorApi'), 'error');
        }
    };

    const handleConnectGoogle = () => {
        const gapi = (window as any).gapi;
        const storedClientId = localStorage.getItem('google_client_id');

        if (!storedClientId) {
            addNotification(t('settings.integrations.errorNoClientId'), 'error');
            return;
        }

        if (!gapi?.load) {
            addNotification(t('settings.integrations.errorGapiNotLoaded'), 'error');
            return;
        }

        setConnectionStatus(t('settings.integrations.statusConnecting'));

        const handleAuth = () => {
            const authInstance = gapi.auth2.getAuthInstance();
            if (!authInstance) {
                 addNotification(t('settings.integrations.errorGapiNotLoaded'), 'error');
                 setConnectionStatus(t('settings.integrations.statusFailed'));
                 return;
            }
            
            const signInOptions = {
                prompt: 'select_account'
            };

            authInstance.signIn(signInOptions).then(
                processGbpConnection, 
                (err: any) => {
                    console.error('Sign-in error:', err);
                    setConnectionStatus(t('settings.integrations.statusFailed'));
                    addNotification(t('settings.integrations.errorSignIn'), 'error');
                }
            );
        };

        gapi.load('client:auth2', () => {
            if (!gapi.auth2.getAuthInstance()) {
                gapi.client.init({
                    clientId: storedClientId,
                    scope: 'https://www.googleapis.com/auth/business.manage',
                    plugin_name: 'AgentOS'
                }).then(handleAuth, (error: any) => {
                     console.error("GAPI init error:", error);
                     setConnectionStatus(t('settings.integrations.statusFailed'));
                     addNotification(t('settings.integrations.errorGapiNotLoaded'), 'error');
                });
            } else {
                handleAuth();
            }
        });
    };

    const handleConnectSocial = (platform: SocialPlatform) => {
        setAuthModalPlatform(platform);
    };
    
    const handleAuthSuccess = (platformKey: string) => {
        const mockAccount = {
            accountName: `agent_os_page_${platformKey}`,
            profileUrl: `https://${platformKey}.com/agent_os_page`
        };
        connectPlatform(platformKey, mockAccount);
        addNotification(`Successfully connected to ${authModalPlatform?.name}!`, 'success');
        setAuthModalPlatform(null);
    };

    const handleNotificationToggle = async (enabled: boolean) => {
        if (enabled && Notification.permission === 'denied') {
            setPermissionDenied(true);
            addNotification(t('settings.notifications.permissionDenied'), 'warning');
            return;
        }

        if (enabled) {
            const permission = await requestNotificationPermission();
            if (permission === 'granted') {
                setPermissionDenied(false);
                setNotificationsEnabled(true);
                addNotification(t('settings.notifications.enabledSuccess'), 'success');
                showDemoNotification(t);
            } else {
                setPermissionDenied(permission === 'denied');
                if (permission === 'denied') {
                    addNotification(t('settings.notifications.permissionDenied'), 'warning');
                }
                setNotificationsEnabled(false);
            }
        } else {
            setNotificationsEnabled(false);
        }
    };

    // -- Sub-components for Tabs --

    const NavButton = ({ tab, label, icon }: { tab: SettingsTab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const GeneralSettings = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">{t('settings.general.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.general.timezone')}</label>
                        <select 
                            value={timezone} 
                            onChange={(e) => setTimezone(e.target.value)} 
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="Europe/Athens">Europe/Athens (GMT+2)</option>
                            <option value="Europe/London">Europe/London (GMT+0)</option>
                            <option value="America/New_York">America/New_York (GMT-5)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('settings.general.dateFormat')}</label>
                        <select 
                            value={dateFormat} 
                            onChange={(e) => setDateFormat(e.target.value)} 
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">{t('settings.appearance.title')}</h3>
                <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {theme === 'dark' ? t('settings.appearance.darkMode') : t('settings.appearance.lightMode')}
                    </span>
                    <ToggleSwitch
                        id="theme-toggle"
                        checked={theme === 'dark'}
                        onChange={toggleTheme}
                        aria-label="Toggle dark mode"
                    />
                </div>
            </div>
        </div>
    );

    const SecuritySettings = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">{t('settings.security.title')}</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b dark:border-gray-700">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{t('settings.security.twoFactor')}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.security.twoFactorDesc')}</p>
                        </div>
                        <button className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm">
                            {t('settings.security.enable2FA')}
                        </button>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Password</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
                        </div>
                        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm">
                            {t('settings.security.changePassword')}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                🛡️ {t('settings.security.lastLogin', { date: new Date().toLocaleDateString() })}
            </div>
        </div>
    );

    const NotificationsSettings = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">{t('settings.notifications.title')}</h3>
            
            {permissionDenied && <PermissionDeniedWarning />}

            <div className={`flex items-center justify-between mb-6 ${permissionDenied ? 'opacity-50' : ''}`}>
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t('settings.notifications.enableLabel')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.notifications.description')}</p>
                </div>
                <ToggleSwitch
                    id="notification-toggle"
                    checked={isNotificationsEnabled && !permissionDenied}
                    onChange={(e) => handleNotificationToggle(e.target.checked)}
                    disabled={permissionDenied}
                />
            </div>
            
            <button 
                onClick={() => showDemoNotification(t)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:text-gray-400 mb-4"
                disabled={!isNotificationsEnabled || permissionDenied}
            >
                {t('settings.notifications.previewLink')}
            </button>
            
            <NotificationEventSettings 
                settings={individualSettings}
                updateSetting={updateIndividualSetting}
                masterEnabled={isNotificationsEnabled && !permissionDenied}
            />
        </div>
    );

    const IntegrationSettings = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">{t('settings.setup.title')}</h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.setup.googleClientId')}</label>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            placeholder={t('settings.setup.googleClientIdPlaceholder') as string}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.setup.geminiApiKey')}</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                placeholder={t('settings.setup.geminiApiKeyPlaceholder') as string}
                            />
                            <button
                                onClick={handleSaveKeys}
                                className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm whitespace-nowrap"
                            >
                                {t('settings.setup.saveButton')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">{t('settings.socialConnections.title')}</h3>
                <div className="space-y-4">
                    {SOCIAL_PLATFORMS.map(platform => (
                        <SocialConnectionRow
                            key={platform.key}
                            platform={platform}
                            connection={connections[platform.key as keyof typeof connections]}
                            onConnect={() => handleConnectSocial(platform)}
                            onDisconnect={() => disconnectPlatform(platform.key)}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">{t('settings.integrations.gbp')}</h3>
                        <p className="text-sm text-gray-500 mt-1">{connectionStatus}</p>
                    </div>
                    <button
                        onClick={handleConnectGoogle}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm"
                    >
                        {t('settings.integrations.connectButton')}
                    </button>
                </div>
            </div>
        </div>
    );

    const AuditSettings = () => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 animate-fade-in text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.audit.title')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">{t('settings.audit.description')}</p>
            <button className="mt-6 px-6 py-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium">
                {t('settings.audit.viewFullLog')}
            </button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 px-2">{t('settings.title')}</h1>
                    <nav className="space-y-1">
                        <NavButton 
                            tab="general" 
                            label={t('settings.nav.general')} 
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} 
                        />
                        <NavButton 
                            tab="security" 
                            label={t('settings.nav.security')} 
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} 
                        />
                        <NavButton 
                            tab="notifications" 
                            label={t('settings.nav.notifications')} 
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} 
                        />
                        <NavButton 
                            tab="integrations" 
                            label={t('settings.nav.integrations')} 
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} 
                        />
                        <NavButton 
                            tab="audit" 
                            label={t('settings.nav.audit')} 
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} 
                        />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {activeTab === 'general' && <GeneralSettings />}
                    {activeTab === 'security' && <SecuritySettings />}
                    {activeTab === 'notifications' && <NotificationsSettings />}
                    {activeTab === 'integrations' && <IntegrationSettings />}
                    {activeTab === 'audit' && <AuditSettings />}
                </main>
            </div>

            {authModalPlatform && (
                <SocialAuthModal
                    platform={authModalPlatform}
                    onClose={() => setAuthModalPlatform(null)}
                    onSuccess={handleAuthSuccess}
                />
            )}
        </div>
    );
};

export default Settings;
