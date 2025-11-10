import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: "12px"}} />
                    <Line type="monotone" dataKey="submitted" name={t('executive.submitted')} stroke="#3b82f6" />
                    <Line type="monotone" dataKey="approved" name={t('executive.approved')} stroke="#10b981" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ClaimsTrendChart;
