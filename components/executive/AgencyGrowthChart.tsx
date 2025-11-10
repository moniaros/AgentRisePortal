import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';

interface AgencyGrowthChartProps {
    data: { month: string; premium: number; policies: number }[];
}

const AgencyGrowthChart: React.FC<AgencyGrowthChartProps> = ({ data }) => {
    const { t } = useLocalization();

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('executive.agencyGrowth')}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tickFormatter={(value) => `€${value / 1000}k`} tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value, name) => name === 'Premium' ? `€${(value as number).toLocaleString()}` : value} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="premium" name="Premium" stroke="#3b82f6" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="policies" name="Policies" stroke="#10b981" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AgencyGrowthChart;
