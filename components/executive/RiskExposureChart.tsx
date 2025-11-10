import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';

interface RiskExposureChartProps {
    data: { area: string; exposure: number; mitigation: number }[];
}

const RiskExposureChart: React.FC<RiskExposureChartProps> = ({ data }) => {
    const { t } = useLocalization();

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('executive.riskExposure')}</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="area" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{fontSize: "12px"}} />
                    <Bar dataKey="exposure" name={t('executive.totalExposure')} stackId="a" fill="#ef4444" />
                    <Bar dataKey="mitigation" name={t('executive.mitigatedRisk')} stackId="a" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RiskExposureChart;
