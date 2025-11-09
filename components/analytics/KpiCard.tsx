import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | number;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default KpiCard;
