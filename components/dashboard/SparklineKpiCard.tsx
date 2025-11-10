import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';
import SkeletonLoader from '../ui/SkeletonLoader';

interface SparklineKpiCardProps {
    title: string;
    current: number;
    previous: number;
    trendData: { date: string; count: number }[];
    isLoading: boolean;
}

const UpArrow = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>;
const DownArrow = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;


const SparklineKpiCard: React.FC<SparklineKpiCardProps> = ({ title, current, previous, trendData, isLoading }) => {
    const { t } = useLocalization();

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <SkeletonLoader className="h-24 w-full" />
            </div>
        );
    }

    const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
    const isPositive = change >= 0;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <div className="flex justify-between items-end">
                <div>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{current.toLocaleString()}</p>
                    <div className={`flex items-center text-sm mt-2 font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <UpArrow /> : <DownArrow />}
                        <span className="ml-1">{Math.abs(change).toFixed(1)}%</span>
                        <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">{t('dashboard.vsLastMonth')}</span>
                    </div>
                </div>
                <div className="w-24 h-12">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <Line type="monotone" dataKey="count" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SparklineKpiCard;
