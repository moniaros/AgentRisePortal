import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ICONS } from '../constants';

const Support: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-blue-500 mb-4">
                {React.cloneElement(ICONS.support, { className: "h-24 w-24" })}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('support.title')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                {t('support.description')}
            </p>
        </div>
    );
};

export default Support;