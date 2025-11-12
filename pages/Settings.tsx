import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useNotification } from '../hooks/useNotification';
import { useTheme } from '../hooks/useTheme';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { socialNetworkService, SocialPlatform, SocialConnection } from '../services/socialNetworkService';

const Settings: React.FC = () => {
    const { t } = useLocalization();
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const [clientId, setClientId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [connectionStatus, setConnectionStatus] = useState(t('settings.integrations.statusNotConnected'));
    const { theme, toggleTheme } = useTheme();

    // Social network states
    const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([]);
    const [loadingSocial, setLoadingSocial] = useState(false);
    const [connectingPlatform, setConnectingPlatform] = useState<SocialPlatform | null>(null);

    const platforms: { id: SocialPlatform; name: string; icon: string; color: string }[] = [
        { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600 hover:bg-blue-700' },
        { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-600 hover:bg-pink-700' },
        { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700 hover:bg-blue-800' },
        { id: 'x', name: 'X (Twitter)', icon: '𝕏', color: 'bg-black hover:bg-gray-800' },
        { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-gray-900 hover:bg-black' },
        { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'bg-red-600 hover:bg-red-700' },
    ];

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

        // Fetch social network connections
        fetchSocialConnections();
    }, [t]);

    const fetchSocialConnections = async () => {
        try {
            setLoadingSocial(true);
            const connections = await socialNetworkService.getConnections();
            setSocialConnections(connections);
        } catch (error) {
            console.error('Error fetching social connections:', error);
        } finally {
            setLoadingSocial(false);
        }
    };

    const handleConnectSocial = async (platform: SocialPlatform) => {
        try {
            setConnectingPlatform(platform);
            const success = await socialNetworkService.connectPlatform(platform);

            if (success) {
                addNotification(`Successfully connected to ${platforms.find(p => p.id === platform)?.name}`, 'success');
                await fetchSocialConnections();
            } else {
                addNotification(`Failed to connect to ${platforms.find(p => p.id === platform)?.name}`, 'error');
            }
        } catch (error) {
            console.error(`Error connecting to ${platform}:`, error);
            addNotification(`Error connecting to ${platforms.find(p => p.id === platform)?.name}`, 'error');
        } finally {
            setConnectingPlatform(null);
        }
    };

    const handleDisconnectSocial = async (connectionId: number, platformName: string) => {
        try {
            await socialNetworkService.disconnect(connectionId);
            addNotification(`Successfully disconnected from ${platformName}`, 'success');
            await fetchSocialConnections();
        } catch (error) {
            console.error(`Error disconnecting from ${platformName}:`, error);
            addNotification(`Error disconnecting from ${platformName}`, 'error');
        }
    };

    const getSocialConnection = (platform: SocialPlatform): SocialConnection | undefined => {
        return socialConnections.find(conn => conn.platform === platform && conn.isActive);
    };

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

            {/* Social Network Connections */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Social Network Connections
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Connect your social media accounts to create and manage posts and ads directly from the platform.
                </p>

                {loadingSocial ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading connections...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {platforms.map((platform) => {
                            const connection = getSocialConnection(platform.id);
                            const isConnected = !!connection;
                            const isConnecting = connectingPlatform === platform.id;

                            return (
                                <div
                                    key={platform.id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{platform.icon}</span>
                                        <div>
                                            <h3 className="font-medium text-gray-800 dark:text-white">
                                                {platform.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {isConnected ? (
                                                    <>
                                                        <span className="text-green-600 dark:text-green-400">● Connected</span>
                                                        {connection.accountName && ` as ${connection.accountName}`}
                                                    </>
                                                ) : (
                                                    'Not connected'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        {isConnected ? (
                                            <button
                                                onClick={() => handleDisconnectSocial(connection!.id, platform.name)}
                                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                                            >
                                                Disconnect
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleConnectSocial(platform.id)}
                                                disabled={isConnecting}
                                                className={`px-4 py-2 text-white text-sm rounded-md transition-colors ${
                                                    isConnecting ? 'bg-gray-400 cursor-not-allowed' : platform.color
                                                }`}
                                            >
                                                {isConnecting ? 'Connecting...' : 'Connect'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;