import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';

interface PerformanceChartProps {
    data: {
        date: string;
        impressions: number;
        clicks: number;
        conversions: number;
    }[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
    const { t } = useLocalization();

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('campaignAnalytics.charts.performanceTitle')}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(31, 41, 55, 0.8)', // bg-gray-800 with opacity
                            border: '1px solid #4B5563', // border-gray-600
                            borderRadius: '0.5rem' // rounded-lg
                        }}
                        labelStyle={{ color: '#F9FAFB' }} // text-gray-50
                    />
                    <Legend wrapperStyle={{fontSize: "12px"}} />
                    <Line type="monotone" dataKey="impressions" name={t('campaignAnalytics.charts.impressions')} stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="clicks" name={t('campaignAnalytics.charts.clicks')} stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="conversions" name={t('campaignAnalytics.charts.conversions')} stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PerformanceChart;