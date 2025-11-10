import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';
import { Lead } from '../../types';

interface LeadSourceChartProps {
    leads: Lead[];
}

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f97316', '#a855f7'];

const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ leads }) => {
    const { t } = useLocalization();

    const data = useMemo(() => {
        const sourceCounts = leads.reduce((acc, lead) => {
            acc[lead.source] = (acc[lead.source] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));
    }, [leads]);

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('leadsDashboard.charts.sourceTitle')}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(31, 41, 55, 0.8)',
                            border: '1px solid #4B5563',
                            borderRadius: '0.5rem'
                        }}
                        labelStyle={{ color: '#F9FAFB' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LeadSourceChart;
