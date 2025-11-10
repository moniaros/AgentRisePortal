import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SkeletonLoader from '../ui/SkeletonLoader';

interface GaugeKpiCardProps {
    title: string;
    value: number; // A percentage from 0 to 100
    isLoading: boolean;
}

const GaugeKpiCard: React.FC<GaugeKpiCardProps> = ({ title, value, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <SkeletonLoader className="h-24 w-full" />
            </div>
        );
    }

    const color = value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
    const data = [
        { name: 'Value', value: value },
        { name: 'Remaining', value: 100 - value },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">{title}</h3>
            <div className="relative w-40 h-24 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                        >
                            <Cell key="cell-0" fill={color} />
                            <Cell key="cell-1" fill="#e5e7eb" className="dark:fill-gray-700" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-x-0 bottom-4 text-center">
                    <span className="text-3xl font-semibold" style={{ color }}>{value}%</span>
                </div>
            </div>
        </div>
    );
};

export default GaugeKpiCard;
