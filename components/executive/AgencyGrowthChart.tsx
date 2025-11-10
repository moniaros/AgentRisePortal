import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: "12px"}} />
                    <Bar yAxisId="left" dataKey="premium" name={t('executive.premiumWritten')} fill="#3b82f6" />
                    <Bar yAxisId="right" dataKey="policies" name={t('executive.policiesBound')} fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AgencyGrowthChart;
