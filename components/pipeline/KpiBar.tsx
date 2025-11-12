import React, { useMemo } from 'react';
import { Opportunity__EXT, TransactionInquiry, Conversion } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import KpiCard from '../analytics/KpiCard';

interface KpiBarProps {
    opportunities: Opportunity__EXT[];
    inquiries: TransactionInquiry[];
    conversions: Conversion[];
}

const KpiBar: React.FC<KpiBarProps> = ({ opportunities, inquiries, conversions }) => {
    const { t } = useLocalization();

    const kpis = useMemo(() => {
        const opportunityInquiryIds = new Set(opportunities.map(opp => opp.inquiryId));
        const newLeads = inquiries.filter(inq => !opportunityInquiryIds.has(inq.id)).length;
        
        const proposalsSent = opportunities.filter(opp => ['proposal', 'won', 'lost'].includes(opp.stage)).length;
        const wonOpportunities = opportunities.filter(opp => opp.stage === 'won');
        const wonCount = wonOpportunities.length;
        const wonGwp = wonOpportunities.reduce((sum, opp) => sum + opp.value, 0);

        const totalOpportunities = opportunities.length;
        const conversionRate = totalOpportunities > 0 ? (wonCount / totalOpportunities) * 100 : 0;

        return { newLeads, proposalsSent, wonCount, wonGwp, conversionRate };
    }, [opportunities, inquiries, conversions]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard title={t('pipeline.kpis.newLeads')} value={kpis.newLeads} variant="info" />
            <KpiCard title={t('pipeline.kpis.proposalsSent')} value={kpis.proposalsSent} />
            <KpiCard title={t('pipeline.kpis.wonCount')} value={kpis.wonCount} variant="success" />
            <KpiCard title={t('pipeline.kpis.wonGwp')} value={`€${kpis.wonGwp.toLocaleString()}`} variant="success" />
            <KpiCard title={t('pipeline.kpis.conversionRate')} value={`${kpis.conversionRate.toFixed(1)}%`} variant="success" />
        </div>
    );
};

export default KpiBar;
