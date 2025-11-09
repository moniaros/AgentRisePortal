import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const Analytics: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Analytics</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                This page is a placeholder for future analytics dashboards. It would visualize data on leads, conversions, policy sales, and agent performance using charts and graphs.
            </p>
        </div>
    );
};

export default Analytics;
