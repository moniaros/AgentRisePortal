import React from 'react';
import { ResponsiveContainer, FunnelChart, Funnel, Tooltip, LabelList } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';
import SkeletonLoader from '../ui/SkeletonLoader';

interface ConversionFunnelChartProps {
    data?: {
        leads: number;
        quotesIssued: number;
        policiesBound: number;
    };
    isLoading: boolean;
}

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ data, isLoading }) => {
    const { t } = useLocalization();

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
                <SkeletonLoader className="h-full w-full" />
            </div>
        );
    }
    
    const funnelData = [
        { name: t('dashboard.funnel.leads'), value: data?.leads ?? 0, fill: '#3b82f6' },
        { name: t('dashboard.funnel.quotes'), value: data?.quotesIssued ?? 0, fill: '#60a5fa' },
        { name: t('dashboard.funnel.policies'), value: data?.policiesBound ?? 0, fill: '#93c5fd' },
    ];


    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.salesFunnel')}</h2>
            <ResponsiveContainer width="100%" height={250}>
                <FunnelChart>
                    <Tooltip />
                    <Funnel
                        dataKey="value"
                        data={funnelData}
                        isAnimationActive
                    >
                         <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                    </Funnel>
                </FunnelChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ConversionFunnelChart;
