import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useCampaigns } from '../hooks/useCampaigns';
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import KpiCard from '../components/analytics/KpiCard';
import PerformanceChart from '../components/analytics/PerformanceChart';
import SpendChart from '../components/analytics/SpendChart';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import { Campaign, Language } from '../types';

const Analytics: React.FC = () => {
    const { t } = useLocalization();
    const { data: analyticsData, isLoading: isAnalyticsLoading, error: analyticsError } = useAnalyticsData();
    const { campaigns, isLoading: isCampaignsLoading, error: campaignsError } = useCampaigns();

    const [filters, setFilters] = useState({
        campaignId: 'all',
        network: 'all',
        period: 90, // days
        language: 'all' as 'all' | Language,
    });

    const isLoading = isAnalyticsLoading || isCampaignsLoading;
    const error = analyticsError || campaignsError;

    const filteredData = useMemo(() => {
        if (!analyticsData || !campaigns) return [];
        
        // FIX: Explicitly type campaignMap to ensure correct type inference for campaign objects.
        const campaignMap: Map<string, Campaign> = new Map(campaigns.map(c => [c.id, c]));
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - filters.period);

        return analyticsData.filter(d => {
            const campaign = campaignMap.get(d.campaignId);
            if (!campaign) return false;
            
            const recordDate = new Date(d.date);
            const isAfterStartDate = recordDate >= startDate;
            
            const campaignMatch = filters.campaignId === 'all' || d.campaignId === filters.campaignId;
            const networkMatch = filters.network === 'all' || campaign.network === filters.network;
            const languageMatch = filters.language === 'all' || campaign.language === filters.language;

            return isAfterStartDate && campaignMatch && networkMatch && languageMatch;
        });
    }, [analyticsData, campaigns, filters]);

    const aggregatedData = useMemo(() => {
        // FIX: Explicitly type campaignMap to ensure correct type inference for campaign objects.
        const campaignMap: Map<string, Campaign> = new Map(campaigns.map(c => [c.id, c]));

        const totalSpend = filteredData.reduce((sum, d) => sum + d.spend, 0);
        const totalImpressions = filteredData.reduce((sum, d) => sum + d.impressions, 0);
        const totalClicks = filteredData.reduce((sum, d) => sum + d.clicks, 0);
        const totalConversions = filteredData.reduce((sum, d) => sum + d.conversions, 0);
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        const spendByNetwork = filteredData.reduce<Record<string, number>>((acc, d) => {
            const network = campaignMap.get(d.campaignId)?.network || 'unknown';
            acc[network] = (acc[network] || 0) + d.spend;
            return acc;
        }, {});
        
        // FIX: Use a generic on reduce to ensure the accumulator's type is inferred correctly.
        // This prevents Object.values from returning unknown[] and fixes downstream errors.
        const performanceOverTime = filteredData.reduce<Record<string, { date: string; impressions: number; clicks: number; conversions: number; }>>((acc, d) => {
            if (!acc[d.date]) {
                acc[d.date] = { date: d.date, impressions: 0, clicks: 0, conversions: 0 };
            }
            acc[d.date].impressions += d.impressions;
            acc[d.date].clicks += d.clicks;
            acc[d.date].conversions += d.conversions;
            return acc;
        }, {});

        return {
            totalSpend,
            totalImpressions,
            totalClicks,
            totalConversions,
            ctr,
            spendByNetwork: Object.entries(spendByNetwork).map(([name, value]) => ({ name, spend: value })),
            // FIX: Explicitly type the arguments of the sort function. Object.values() can return `unknown[]`, so this allows accessing properties safely.
            performanceOverTime: Object.values(performanceOverTime).sort((a: { date: string },b: { date: string }) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        };
    }, [filteredData, campaigns]);
    
    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('analytics.title')}</h1>
            
            {isLoading ? <SkeletonLoader className="h-24 w-full mb-6" /> : (
                <AnalyticsFilters
                    campaigns={campaigns}
                    filters={filters}
                    onFilterChange={setFilters}
                />
            )}
            
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    {[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-24 w-full" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    <KpiCard title={t('analytics.kpis.totalSpend')} value={`€${aggregatedData.totalSpend.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                    <KpiCard title={t('analytics.kpis.totalImpressions')} value={aggregatedData.totalImpressions.toLocaleString('el-GR')} />
                    <KpiCard title={t('analytics.kpis.ctr')} value={`${aggregatedData.ctr.toFixed(2)}%`} />
                    <KpiCard title={t('analytics.kpis.totalConversions')} value={aggregatedData.totalConversions.toLocaleString('el-GR')} />
                </div>
            )}
            
            {isLoading ? (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <SkeletonLoader className="h-80 w-full lg:col-span-2" />
                    <SkeletonLoader className="h-80 w-full" />
                 </div>
            ) : (
                filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2">
                           <PerformanceChart data={aggregatedData.performanceOverTime} />
                        </div>
                        <div>
                            <SpendChart data={aggregatedData.spendByNetwork} />
                        </div>
                    </div>
                ) : (
                    <div className="mt-6 text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <p>{t('analytics.noData')}</p>
                    </div>
                )
            )}
        </div>
    );
};

export default Analytics;