import React from 'react';

interface ErrorRateChartProps {
    errorRate: number;
}

const ErrorRateChart: React.FC<ErrorRateChartProps> = ({ errorRate }) => (
     <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Error Rate (24h)</h3>
        <p className="mt-1 text-3xl font-semibold text-red-500">{errorRate}%</p>
    </div>
);

export default ErrorRateChart;
