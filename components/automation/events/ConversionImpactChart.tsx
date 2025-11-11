import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useLocalization } from '../../../hooks/useLocalization';
import { AutomationAnalytics } from '../../../types';

interface ConversionImpactChartProps {
    analytics: AutomationAnalytics;
}

const ConversionImpactChart: React.FC<ConversionImpactChartProps> = ({ analytics }) => {
    const { t } = useLocalization();

    const data = [
        { name: 'Before Automation', value: analytics.conversionRateBefore },
        { name: 'With Automation', value: analytics.conversionRateAfter },
    ];

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-96">
            <h3 className="text-lg font-semibold mb-4">{t('automationRules.eventLog.charts.conversionImpact')}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" name="Conversion Rate" fill="#8884d8" barSize={35}>
                         <Cell fill="#f97316" />
                         <Cell fill="#22c55e" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ConversionImpactChart;