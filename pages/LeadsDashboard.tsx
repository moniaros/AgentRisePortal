import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useCrmData } from '../hooks/useCrmData';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import KpiCard from '../components/analytics/KpiCard';
import LeadSourceChart from '../components/leads/LeadSourceChart';
import LeadStatusFunnel from '../components/leads/LeadStatusFunnel';

const LeadsDashboard: React.FC = () => {
    const { t } = useLocalization();
    const { leads, isLoading, error } = useCrmData();

    const renderKpiCards = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-24 w-full" />)}
                </div>
            );
        }

        const newLeads = leads.filter(l => l.status === 'new').length;
        const totalLeads = leads.length;
        const closedLeads = leads.filter(l => l.status === 'closed').length;
        const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0;
        
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title={t('leadsDashboard.kpis.totalLeads')} value={totalLeads} />
                <KpiCard title={t('leadsDashboard.kpis.newLeads')} value={newLeads} />
                <KpiCard title={t('leadsDashboard.kpis.conversionRate')} value={`${conversionRate}%`} />
                <KpiCard title={t('leadsDashboard.kpis.closedDeals')} value={closedLeads} />
            </div>
        );
    };

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('nav.leadsDashboard')}</h1>

            {renderKpiCards()}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
                <div className="lg:col-span-2">
                    {isLoading ? <SkeletonLoader className="h-80 w-full" /> : <LeadSourceChart leads={leads} />}
                </div>
                 <div className="lg:col-span-3">
                    {isLoading ? <SkeletonLoader className="h-80 w-full" /> : <LeadStatusFunnel leads={leads} />}
                </div>
            </div>
        </div>
    );
};

export default LeadsDashboard;
