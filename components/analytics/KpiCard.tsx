import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );
};

export default KpiCard;