
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

const Settings: React.FC = () => {
    const { t } = useLocalization();
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const [clientId, setClientId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [connectionStatus, setConnectionStatus] = useState(t('settings.integrations.statusNotConnected'));
    const { theme, toggleTheme } = useTheme();

    const { connections, connectPlatform, disconnectPlatform } = useSocialConnections();
    const [authModalPlatform, setAuthModalPlatform] = useState<SocialPlatform | null>(null);

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

        // Periodically check for permission changes if the user changes them in another tab
        const interval = setInterval(() => {
            const currentPermission = Notification.permission;
            if (currentPermission === 'denied' && !permissionDenied) {
                setPermissionDenied(true);
                setNotificationsEnabled(false); // Also disable the master toggle
            }
            if (currentPermission !== 'denied' && permissionDenied) {
                setPermissionDenied(false);
            }
        }, 1000);
        return () => clearInterval(interval);

    }, [t, permissionDenied, setNotificationsEnabled]);

    const handleSave = () => {
        localStorage.setItem('google_client_id', clientId);
        localStorage.setItem('gemini_api_key', apiKey);
        addNotification(t('settings.setup.saveSuccess'), 'success');
    };

    const processGbpConnection = async () => {
        const gapi = (window as any).gapi;
        try {
            // 1. Load the My Business API client
            await gapi.client.load('mybusinessbusinessinformation', 'v1');
            
            // 2. Get accounts
            setConnectionStatus(t('settings.integrations.statusFetchingProfiles'));
            const accountsResponse = await gapi.client.mybusinessbusinessinformation.accounts.list();
            const accounts = accountsResponse.result.accounts;

            if (!accounts || accounts.length === 0) {
                setConnectionStatus(t('settings.integrations.statusNoAccounts'));
                addNotification(t('settings.integrations.warningNoAccounts'), 'warning');
                return;
            }
            const firstAccount = accounts[0];

            // 3. Get locations for the first account
            setConnectionStatus(t('settings.integrations.statusFetchingLocations'));
            const locationsResponse = await gapi.client.mybusinessbusinessinformation.accounts.locations.list({
                parent: firstAccount.name,
                pageSize: 1,
                readMask: 'name,title' // Only request fields we need
            });
            const locations = locationsResponse.result.locations;

            if (!locations || locations.length === 0) {
                setConnectionStatus(t('settings.integrations.statusNoLocations'));
                addNotification(t('settings.integrations.warningNoLocations'), 'warning');
                return;
            }
            const firstLocation = locations[0];
            const businessName = firstLocation.title;
            const locationName = firstLocation.name; // This is the ID, e.g., "accounts/123/locations/456"

            // 4. Save to localStorage and update status
            localStorage.setItem('gbp_location_name', locationName);
            localStorage.setItem('gbp_location_title', businessName);
            setConnectionStatus(t('settings.integrations.statusConnectedTo', { businessName }));
            addNotification(t('settings.integrations.successConnected', { businessName }), 'success');

            // 5. Redirect
            setTimeout(() => navigate('/'), 1500); // Short delay to let user see success message

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
                prompt: 'select_account' // Always ask user to select account
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
        // In a real app, you'd get this info from the OAuth callback
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


    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.appSettings')}</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">{t('settings.appearance.title')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('settings.appearance.description')}</p>
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

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">{t('settings.notifications.title')}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('settings.notifications.description')}</p>
                
                {permissionDenied && <PermissionDeniedWarning />}

                <div className={`flex items-center justify-between ${permissionDenied ? 'mt-4' : ''}`}>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {t('settings.notifications.enableLabel')}
                    </span>
                    <ToggleSwitch
                        id="notification-toggle"
                        checked={isNotificationsEnabled && !permissionDenied}
                        onChange={(e) => handleNotificationToggle(e.target.checked)}
                        aria-label={t('settings.notifications.enableLabel') as string}
                        disabled={permissionDenied}
                    />
                </div>
                
                <div className="mt-4">
                    <button 
                        onClick={() => showDemoNotification(t)}
                        className="text-sm text-blue-500 hover:underline disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                        disabled={!isNotificationsEnabled || permissionDenied}
                    >
                        {t('settings.notifications.previewLink')}
                    </button>
                </div>
                
                <NotificationEventSettings 
                    settings={individualSettings}
                    updateSetting={updateIndividualSetting}
                    masterEnabled={isNotificationsEnabled && !permissionDenied}
                />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">{t('settings.setup.title')}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.setup.googleClientId')}</label>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            placeholder={t('settings.setup.googleClientIdPlaceholder')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('settings.setup.geminiApiKey')}</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            placeholder={t('settings.setup.geminiApiKeyPlaceholder')}
                        />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            {t('settings.setup.saveButton')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">{t('settings.socialConnections.title')}</h2>
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

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">{t('settings.integrations.title')}</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">{t('settings.integrations.gbp')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{connectionStatus}</p>
                    </div>
                    <button
                        onClick={handleConnectGoogle}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        {t('settings.integrations.connectButton')}
                    </button>
                </div>
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
