import React, { useState } from 'react';
import { SocialPlatform, SocialConnection } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface SocialConnectionRowProps {
    platform: SocialPlatform;
    connection: SocialConnection;
    onConnect: () => void;
    onDisconnect: () => void;
}

const SocialConnectionRow: React.FC<SocialConnectionRowProps> = ({ platform, connection, onConnect, onDisconnect }) => {
    const { t } = useLocalization();
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 gap-4">
            <div className="flex items-center gap-4">
                {platform.icon}
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{platform.name}</span>
                        <div className="relative flex items-center">
                            <button
                                onMouseEnter={() => setIsTooltipVisible(true)}
                                onMouseLeave={() => setIsTooltipVisible(false)}
                                onFocus={() => setIsTooltipVisible(true)}
                                onBlur={() => setIsTooltipVisible(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                aria-label={`More info about connecting ${platform.name}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                            {isTooltipVisible && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-xs bg-gray-800 text-white rounded-md shadow-lg z-10 animate-fade-in" role="tooltip">
                                    {t(`settings.socialConnections.platforms.${platform.key}.tooltip`)}
                                </div>
                            )}
                        </div>
                    </div>
                    {connection?.isConnected ? (
                        <a href={connection.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline block" aria-label={`View profile ${connection.accountName}`}>
                            {connection.accountName}
                        </a>
                    ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('settings.socialConnections.statusNotConnected')}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${connection?.isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                    {connection?.isConnected ? t('settings.socialConnections.statusConnected') : t('settings.socialConnections.statusNotConnected')}
                </span>
                {connection?.isConnected ? (
                    <button onClick={onDisconnect} className="px-3 py-1.5 text-sm bg-red-100 text-red-700 border border-red-200 rounded-md hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-900/60">
                        {t('settings.socialConnections.disconnectButton')}
                    </button>
                ) : (
                    <button onClick={onConnect} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('settings.socialConnections.connectButton')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default SocialConnectionRow;
