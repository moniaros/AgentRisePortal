
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useNotification } from '../hooks/useNotification';

const Settings: React.FC = () => {
    const { t } = useLocalization();
    const { addNotification } = useNotification();
    const [clientId, setClientId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('Status: Not Connected');

    useEffect(() => {
        const savedClientId = localStorage.getItem('google_client_id');
        const savedApiKey = localStorage.getItem('gemini_api_key');
        if (savedClientId) setClientId(savedClientId);
        if (savedApiKey) setApiKey(savedApiKey);

        const checkInitialStatus = () => {
            const gapi = (window as any).gapi;
            if (gapi?.auth2) {
                const authInstance = gapi.auth2.getAuthInstance();
                if (authInstance?.isSignedIn.get()) {
                    setConnectionStatus('Status: Connected');
                }
            }
        };

        const gapi = (window as any).gapi;
        if (gapi) {
            gapi.load('client:auth2', checkInitialStatus);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('google_client_id', clientId);
        localStorage.setItem('gemini_api_key', apiKey);
        addNotification('Settings saved successfully!', 'success');
    };

    const handleConnectGoogle = () => {
        const gapi = (window as any).gapi;
        const storedClientId = localStorage.getItem('google_client_id');

        if (!storedClientId) {
            addNotification('Please save a Google Cloud Client ID first.', 'error');
            return;
        }

        if (!gapi) {
            addNotification('Google API script is not loaded yet. Please wait and try again.', 'error');
            return;
        }

        setConnectionStatus('Status: Connecting...');

        gapi.load('client:auth2', () => {
            gapi.client.init({
                clientId: storedClientId,
                scope: 'https://www.googleapis.com/auth/business.manage',
                plugin_name: 'AgentOS'
            }).then(() => {
                const authInstance = gapi.auth2.getAuthInstance();
                if (!authInstance.isSignedIn.get()) {
                    authInstance.signIn().then(() => {
                        setConnectionStatus('Status: Connected');
                        addNotification('Successfully connected to Google Business Profile!', 'success');
                    }, (error: any) => {
                        console.error('Google Sign-In Error:', error);
                        setConnectionStatus('Status: Connection failed');
                        addNotification('Failed to connect to Google Business Profile.', 'error');
                    });
                } else {
                     setConnectionStatus('Status: Already Connected');
                     addNotification('Already connected to Google Business Profile!', 'info');
                }
            }, (error: any) => {
                console.error('GAPI Client Init Error:', error);
                setConnectionStatus('Status: Initialization failed');
                addNotification('Failed to initialize Google API client.', 'error');
            });
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.appSettings')}</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Setup</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Google Cloud Client ID</label>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Enter your Google Cloud Client ID"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gemini API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Enter your Gemini API Key"
                        />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Integrations</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium">Google Business Profile</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{connectionStatus}</p>
                    </div>
                    <button
                        onClick={handleConnectGoogle}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Connect Google Business Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
