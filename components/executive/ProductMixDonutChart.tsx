import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';
import { PolicyType } from '../../types';

interface ProductMixDonutChartProps {
    data: { name: PolicyType; value: number }[];
}

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f97316', '#a855f7'];

const ProductMixDonutChart: React.FC<ProductMixDonutChartProps> = ({ data }) => {
    const { t } = useLocalization();

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('executive.productMix')}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, t(`policyTypes.${name}`)]} />
                    <Legend formatter={(value) => <span className="capitalize">{t(`policyTypes.${value}`)}</span>} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ProductMixDonutChart;
