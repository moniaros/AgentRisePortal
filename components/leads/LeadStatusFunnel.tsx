import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocalization } from '../../hooks/useLocalization';
import { Lead, LeadStatus } from '../../types';

interface LeadStatusFunnelProps {
    leads: Lead[];
}

const LeadStatusFunnel: React.FC<LeadStatusFunnelProps> = ({ leads }) => {
    const { t } = useLocalization();

    const data = useMemo(() => {
        // FIX: Replaced string literals with LeadStatus enum members to match the type definition.
        const statusOrder: LeadStatus[] = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.CLOSED, LeadStatus.REJECTED];
        const statusCounts = leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {} as Record<LeadStatus, number>);

        return statusOrder.map(status => ({
            name: t(`statusLabels.${status}`),
            value: statusCounts[status] || 0,
        }));
    }, [leads, t]);

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md h-80">
            <h3 className="text-lg font-semibold mb-4">{t('leadsDashboard.charts.funnelTitle')}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip
                        cursor={{ fill: 'rgba(107, 114, 128, 0.1)'}}
                        contentStyle={{
                            backgroundColor: 'rgba(31, 41, 55, 0.8)',
                            border: '1px solid #4B5563',
                            borderRadius: '0.5rem'
                        }}
                         labelStyle={{ color: '#F9FAFB' }}
                    />
                    <Bar dataKey="value" name="Leads" fill="#3b82f6" barSize={30} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LeadStatusFunnel;
