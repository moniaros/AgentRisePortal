
import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';

const PermissionDeniedWarning: React.FC = () => {
    const { t } = useLocalization();

    const browserSupportLinks = {
        chrome: 'https://support.google.com/chrome/answer/3220216',
        safari: 'https://support.apple.com/guide/safari/manage-website-notifications-sfri40734/mac',
        edge: 'https://support.microsoft.com/en-us/microsoft-edge/manage-website-notifications-in-microsoft-edge-0c555609-5bf2-479d-a59d-fb30a0b80b2b',
    };

    return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200" role="alert">
            <h3 className="font-bold">{t('settings.notifications.permissionDeniedWarning.title')}</h3>
            <p className="mt-2 text-sm">{t('settings.notifications.permissionDeniedWarning.description')}</p>
            <div className="mt-4 space-y-3 text-sm">
                <div>
                    <h4 className="font-semibold">{t('settings.notifications.permissionDeniedWarning.chrome')} / {t('settings.notifications.permissionDeniedWarning.edge')}</h4>
                    <p className="whitespace-pre-line">{t('settings.notifications.permissionDeniedWarning.chromeSteps')}</p>
                </div>
                 <div>
                    <h4 className="font-semibold">{t('settings.notifications.permissionDeniedWarning.safari')}</h4>
                    <p className="whitespace-pre-line">{t('settings.notifications.permissionDeniedWarning.safariSteps')}</p>
                </div>
            </div>
            <p className="mt-4 text-xs">
                {t('settings.notifications.permissionDeniedWarning.learnMore')}: 
                <a href={browserSupportLinks.chrome} target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900 dark:hover:text-yellow-100"> Chrome</a>, 
                <a href={browserSupportLinks.edge} target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900 dark:hover:text-yellow-100"> Edge</a>, 
                <a href={browserSupportLinks.safari} target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900 dark:hover:text-yellow-100"> Safari</a>.
            </p>
        </div>
    );
};

export default PermissionDeniedWarning;
