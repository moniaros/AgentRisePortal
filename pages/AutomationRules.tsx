import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const AutomationRules: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                {t('nav.automationRules') as string}
            </h1>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    Automation Rules configuration will be available here in a future update.
                </p>
            </div>
        </div>
    );
};

export default AutomationRules;
