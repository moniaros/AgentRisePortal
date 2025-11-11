import React, { useMemo, useState } from 'react';
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
import { useAllKpiSnapshotsData } from '../hooks/useAllKpiSnapshotsData';
import { useAllLeadsData } from '../hooks/useAllLeadsData';
import { useAllPerformanceData } from '../hooks/useAllPerformanceData';
import { useAllFunnelRunsData } from '../hooks/useAllFunnelRunsData';

const ExecutiveDashboard: React.FC = () => {
    const { t } = useLocalization();
    const { data: executiveData, isLoading: isExecutiveLoading, error: executiveError } = useExecutiveData();
    const { data: analyticsData, isLoading: isAnalyticsLoading, error: analyticsError } = useAnalyticsData();
    const { campaigns, isLoading: isCampaignsLoading, error: campaignsError } = useCampaigns();
    const { allKpiSnapshots, isLoading: isKpiLoading, error: kpiError } = useAllKpiSnapshotsData();
    const { allLeads, isLoading: areLeadsLoading, error: leadsError } = useAllLeadsData();
    const { allPerformanceSamples, isLoading: arePerfLoading, error: perfError } = useAllPerformanceData();
    const { allFunnelRuns, isLoading: areFunnelRunsLoading, error: funnelRunsError } = useAllFunnelRunsData();
    
    const [period, setPeriod] = useState(30); // days

    const isLoading = isExecutiveLoading || isAnalyticsLoading || isCampaignsLoading || isKpiLoading || areLeadsLoading || arePerfLoading || areFunnelRunsLoading;
    const error = executiveError || analyticsError || campaignsError || kpiError || leadsError || perfError || funnelRunsError;

    const filteredSnapshots = useMemo(() => {
        if (!allKpiSnapshots) return [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);
        return allKpiSnapshots.filter(s => {
            const snapshotDate = new Date(s.date);
            return snapshotDate >= startDate && snapshotDate <= endDate;
        });
    }, [allKpiSnapshots, period]);

    const averageReplyTime = useMemo(() => {
        const relevantSnapshots = filteredSnapshots.filter(s => s.avgTimeToFirstReplyH !== undefined);
        if (relevantSnapshots.length === 0) return 0;
        const totalHours = relevantSnapshots.reduce((sum, s) => sum + s.avgTimeToFirstReplyH!, 0);
        return totalHours / relevantSnapshots.length;
    }, [filteredSnapshots]);

    const micrositeFunnelRate = useMemo(() => {
        if (!allFunnelRuns) return { rate: '0.0', leads: 0, pageviews: 0 };
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        const relevantRuns = allFunnelRuns.filter(run => {
            const runDate = new Date(run.date);
            return runDate >= startDate && runDate <= endDate;
        });

        const totalLeads = relevantRuns.reduce((sum, run) => sum + run.leads, 0);
        const totalPageviews = relevantRuns.reduce((sum, run) => sum + run.pageviews, 0);
        
        const rate = totalPageviews > 0 ? ((totalLeads / totalPageviews) * 100).toFixed(1) : '0.0';

        return { rate, leads: totalLeads, pageviews: totalPageviews };
    }, [allFunnelRuns, period]);

    const totalGwpWon = useMemo(() => {
        return filteredSnapshots
            .filter(snapshot => snapshot.source === 'Platform Marketing Leads')
            .reduce((sum, snapshot) => sum + snapshot.won.gwp, 0);
    }, [filteredSnapshots]);

    const leadToWonRate = useMemo(() => {
        if (!allLeads) return { rate: '0.0', wonCount: 0, leadCount: 0 };

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        const wonCount = filteredSnapshots.reduce((sum, s) => sum + s.won.count, 0);
        const leadCount = allLeads.filter(l => new Date(l.createdAt) >= startDate && new Date(l.createdAt) <= endDate).length;
        
        const rate = leadCount > 0 ? ((wonCount / leadCount) * 100).toFixed(1) : '0.0';

        return { rate, wonCount, leadCount };
    }, [filteredSnapshots, allLeads, period]);
    
    const averageCpa = useMemo(() => {
        if (!allPerformanceSamples) return { cpa: 0, spend: 0, won: 0 };

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        const totalSpend = allPerformanceSamples
            .filter(s => {
                const sampleDate = new Date(s.date);
                return sampleDate >= startDate && sampleDate <= endDate;
            })
            .reduce((sum, s) => sum + s.spend, 0);

        const totalWonCount = filteredSnapshots.reduce((sum, s) => sum + s.won.count, 0);

        const cpa = totalWonCount > 0 ? totalSpend / totalWonCount : 0;

        return { cpa, spend: totalSpend, won: totalWonCount };
    }, [filteredSnapshots, allPerformanceSamples, period]);


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
            
            <div className="flex justify-between items-center">
                 <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Campaign Summary</h2>
                 <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">{t('campaignAnalytics.filters.period')}</label>
                    <select value={period} onChange={e => setPeriod(parseInt(e.target.value, 10))} className="p-2 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md">
                        <option value={7}>{t('campaignAnalytics.filters.last7')}</option>
                        <option value={30}>{t('campaignAnalytics.filters.last30')}</option>
                        <option value={90}>{t('campaignAnalytics.filters.last90')}</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-6">
                    {[...Array(9)].map((_, i) => <SkeletonLoader key={i} className="h-24 w-full" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9 gap-6">
                    <KpiCard title={t('executive.kpis.totalGwpWon')} value={`€${totalGwpWon.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} subtitle={t('executive.kpis.totalGwpWonSubtitle')} variant="success" />
                    <KpiCard title={t('executive.kpis.leadToWonRate')} value={`${leadToWonRate.rate}%`} subtitle={t('executive.kpis.leadToWonRateSubtitle', { wonCount: leadToWonRate.wonCount, leadCount: leadToWonRate.leadCount })} />
                    <KpiCard title={t('executive.kpis.avgCpa')} value={`€${averageCpa.cpa.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} subtitle={t('executive.kpis.avgCpaSubtitle', { spend: averageCpa.spend.toLocaleString('el-GR'), count: averageCpa.won })} />
                    <KpiCard title={t('executive.kpis.micrositeFunnelRate')} value={`${micrositeFunnelRate.rate}%`} subtitle={t('executive.kpis.micrositeFunnelRateSubtitle', { leads: micrositeFunnelRate.leads, pageviews: micrositeFunnelRate.pageviews })} variant="info" />
                    <KpiCard title={t('executive.kpis.avgReplyTime')} value={`${averageReplyTime.toFixed(1)} hrs`} subtitle={t('executive.kpis.avgReplyTimeSubtitle')} variant="info" />
                    <KpiCard title={t('campaignAnalytics.kpis.totalSpend')} value={`€${campaignKpis.totalSpend.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                    <KpiCard title={t('campaignAnalytics.kpis.totalImpressions')} value={campaignKpis.totalImpressions.toLocaleString('el-GR')} />
                    <KpiCard title={t('campaignAnalytics.kpis.ctr')} value={`${campaignKpis.ctr.toFixed(2)}%`} />
                    <KpiCard title={t('campaignAnalytics.kpis.totalConversions')} value={campaignKpis.totalConversions.toLocaleString('el-GR')} />
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