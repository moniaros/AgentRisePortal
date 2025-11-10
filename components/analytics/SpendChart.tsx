import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';

interface SpendChartProps {
    data: { name: string; spend: number }[];
}

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f97316', '#a855f7'];

const SpendChart: React.FC<SpendChartProps> = ({ data }) => {
    const { t } = useLocalization();

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('analytics.charts.spendByNetwork')}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="spend"
                        nameKey="name"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                    <Legend wrapperStyle={{fontSize: "12px"}} formatter={(value) => <span className="capitalize">{value}</span>} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendChart;
