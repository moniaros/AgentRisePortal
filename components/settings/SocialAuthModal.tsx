import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { SocialPlatform } from '../../types';

interface SocialAuthModalProps {
    platform: SocialPlatform;
    onClose: () => void;
    onSuccess: (platformKey: string) => void;
}

const SocialAuthModal: React.FC<SocialAuthModalProps> = ({ platform, onClose, onSuccess }) => {
    const { t } = useLocalization();
    const scopes = t(`settings.socialConnections.platforms.${platform.key}.scopes`) as unknown as string[];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b dark:border-gray-700 flex flex-col items-center text-center">
                    <div className="mb-4">
                        {React.cloneElement(platform.icon, { className: "w-12 h-12" })}
                    </div>
                    <h2 className="text-xl font-bold">{t('settings.socialConnections.modalTitle').replace('{platform}', platform.name)}</h2>
                </div>
                <div className="p-6">
                    <h3 className="font-semibold mb-4 text-center">{t('settings.socialConnections.permissionsTitle')}</h3>
                    <ul className="space-y-3">
                        {Array.isArray(scopes) && scopes.map((scope, index) => (
                            <li key={index} className="flex items-start">
                                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{scope}</span>
                            </li>
                        ))}
                    </ul>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
                        {t('settings.socialConnections.complianceText')}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                        {t('settings.socialConnections.cancel')}
                    </button>
                    <button onClick={() => onSuccess(platform.key)} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('settings.socialConnections.allow')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SocialAuthModal;
