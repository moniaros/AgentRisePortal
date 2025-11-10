import React from 'react';
import { FunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';
import { LeadStatus } from '../../types';

interface LeadFunnelChartProps {
    data: { status: LeadStatus; count: number }[];
}

const LeadFunnelChart: React.FC<LeadFunnelChartProps> = ({ data }) => {
    const { t } = useLocalization();

    const formattedData = data.map(d => ({...d, name: t(`statusLabels.${d.status}`), value: d.count}));

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('executive.leadFunnel')}</h3>
            <ResponsiveContainer width="100%" height="90%">
                 <FunnelChart>
                    <Tooltip />
                    <Funnel
                        dataKey="value"
                        data={formattedData}
                        isAnimationActive
                    >
                        <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                    </Funnel>
                </FunnelChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LeadFunnelChart;
