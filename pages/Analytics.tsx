import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ICONS } from '../constants';

const Analytics: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-blue-500 mb-4">
                {React.cloneElement(ICONS.analytics, { className: "h-24 w-24" })}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('nav.analytics')}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                This module is under development. It will provide detailed analytics and reporting on leads, campaigns, and overall performance.
            </p>
             <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">Future Features:</h3>
                <ul className="list-disc list-inside text-left mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <li>Lead conversion funnels</li>
                    <li>Campaign ROI analysis</li>
                    <li>Customer lifetime value tracking</li>
                    <li>Customizable dashboards</li>
                </ul>
            </div>
        </div>
    );
};

export default Analytics;
