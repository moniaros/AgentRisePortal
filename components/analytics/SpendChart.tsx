import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';

interface SpendChartProps {
    data: {
        name: string;
        spend: number;
    }[];
}

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f97316'];

const SpendChart: React.FC<SpendChartProps> = ({ data }) => {
    const { t } = useLocalization();
    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('analytics.charts.spendTitle')}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} style={{ textTransform: 'capitalize' }} />
                    <Tooltip 
                        cursor={{ fill: 'rgba(107, 114, 128, 0.1)'}}
                        contentStyle={{ 
                            backgroundColor: 'rgba(31, 41, 55, 0.8)',
                            border: '1px solid #4B5563',
                            borderRadius: '0.5rem'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                        formatter={(value) => `€${Number(value).toFixed(2)}`}
                    />
                    <Bar dataKey="spend" name="Spend" fill="#8884d8" barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendChart;