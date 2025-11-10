import React, { useMemo } from 'react';
import { FunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';
import { Lead } from '../../types';

interface LeadStatusFunnelProps {
    leads: Lead[];
}

const LeadStatusFunnel: React.FC<LeadStatusFunnelProps> = ({ leads }) => {
    const { t } = useLocalization();

    const funnelData = useMemo(() => {
        const statuses = ['new', 'contacted', 'qualified', 'closed'];
        const counts = leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return statuses.map(status => ({
            name: t(`statusLabels.${status}`),
            value: counts[status] || 0,
        }));
    }, [leads, t]);

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('leadsDashboard.charts.statusFunnel')}</h3>
            <ResponsiveContainer width="100%" height="90%">
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

export default LeadStatusFunnel;
