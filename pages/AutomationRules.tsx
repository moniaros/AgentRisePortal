import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const AutomationRules: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('nav.automationRules')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                {t('common.comingSoon')}
            </p>
        </div>
    );
};

export default AutomationRules;
