import React, { useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useExecutiveData } from '../hooks/useExecutiveData';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useCampaigns } from '../hooks/useCampaigns';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import KpiCard from '../components/analytics/KpiCard';
import AgencyGrowthChart from '../components/executive/AgencyGrowthChart';
import ProductMixDonutChart from '../components/executive/ProductMixDonutChart';
import ClaimsTrendChart from '../components/executive/ClaimsTrendChart';
import LeadFunnelChart from '../components/executive/LeadFunnelChart';
import CampaignRoiTable from '../components/executive/CampaignRoiTable';
import RiskExposureChart from '../components/executive/RiskExposureChart';

const ExecutiveDashboard: React.FC = () => {
    const { t } = useLocalization();
    const { data: executiveData, isLoading: isExecutiveLoading, error: executiveError } = useExecutiveData();
    const { data: analyticsData, isLoading: isAnalyticsLoading, error: analyticsError } = useAnalyticsData();
    const { campaigns, isLoading: isCampaignsLoading, error: campaignsError } = useCampaigns();

    const isLoading = isExecutiveLoading || isAnalyticsLoading || isCampaignsLoading;
    const error = executiveError || analyticsError || campaignsError;

    const campaignKpis = useMemo(() => {
        if (!analyticsData || !campaigns) return { totalSpend: 0, totalImpressions: 0, ctr: 0, totalConversions: 0 };

        const totalSpend = analyticsData.reduce((sum, d) => sum + d.spend, 0);
        const totalImpressions = analyticsData.reduce((sum, d) => sum + d.impressions, 0);
        const totalClicks = analyticsData.reduce((sum, d) => sum + d.clicks, 0);
        const totalConversions = analyticsData.reduce((sum, d) => sum + d.conversions, 0);
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        return { totalSpend, totalImpressions, ctr, totalConversions };
    }, [analyticsData, campaigns]);


    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.executiveAnalytics') as string}</h1>
            
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 -mb-4">Campaign Summary</h2>
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-24 w-full" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard title={t('analytics.kpis.totalSpend')} value={`€${campaignKpis.totalSpend.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                    <KpiCard title={t('analytics.kpis.totalImpressions')} value={campaignKpis.totalImpressions.toLocaleString('el-GR')} />
                    <KpiCard title={t('analytics.kpis.ctr')} value={`${campaignKpis.ctr.toFixed(2)}%`} />
                    <KpiCard title={t('analytics.kpis.totalConversions')} value={campaignKpis.totalConversions.toLocaleString('el-GR')} />
                </div>
            )}

            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 -mb-4 pt-4 border-t dark:border-gray-700">Agency Performance</h2>
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SkeletonLoader className="h-80 w-full" />
                    <SkeletonLoader className="h-80 w-full" />
                    <SkeletonLoader className="h-80 w-full" />
                    <SkeletonLoader className="h-80 w-full" />
                    <SkeletonLoader className="h-80 w-full lg:col-span-2" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AgencyGrowthChart data={executiveData.agencyGrowth} />
                    <ProductMixDonutChart data={executiveData.productMix} />
                    <ClaimsTrendChart data={executiveData.claimsTrend} />
                    <LeadFunnelChart data={executiveData.leadFunnel} />
                    <div className="lg:col-span-2">
                        <CampaignRoiTable data={executiveData.campaignRoi} />
                    </div>
                    <div className="lg:col-span-2">
                       <RiskExposureChart data={executiveData.riskExposure} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutiveDashboard;