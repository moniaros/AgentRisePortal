import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';

interface ClaimsTrendChartProps {
    data: { month: string; submitted: number; approved: number; paid: number }[];
}

const ClaimsTrendChart: React.FC<ClaimsTrendChartProps> = ({ data }) => {
    const { t } = useLocalization();

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('executive.claimsTrend')}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="submitted" name="Submitted" fill="#f97316" />
                    <Bar dataKey="approved" name="Approved" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ClaimsTrendChart;
