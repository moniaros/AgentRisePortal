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
import { useAllOpportunitiesData } from '../hooks/useAllOpportunitiesData';
import { useAllConversionsData } from '../hooks/useAllConversionsData';
import { useCrmData } from '../hooks/useCrmData';
import { useNotification } from '../hooks/useNotification';
import { computeAgencyCommissions, buildBordereauxCsv } from '../lib/commissionEngine';

const ExecutiveDashboard: React.FC = () => {
    const { t } = useLocalization();
    const { addNotification } = useNotification();
    const { customers } = useCrmData();
    const { data: executiveData, isLoading: isExecutiveLoading, error: executiveError } = useExecutiveData();
    const { data: analyticsData, isLoading: isAnalyticsLoading, error: analyticsError } = useAnalyticsData();
    const { campaigns, isLoading: isCampaignsLoading, error: campaignsError } = useCampaigns();
    const { allKpiSnapshots, isLoading: isKpiLoading, error: kpiError } = useAllKpiSnapshotsData();
    const { allLeads, isLoading: areLeadsLoading, error: leadsError } = useAllLeadsData();
    const { allPerformanceSamples, isLoading: arePerfLoading, error: perfError } = useAllPerformanceData();
    const { allFunnelRuns, isLoading: areFunnelRunsLoading, error: funnelRunsError } = useAllFunnelRunsData();
    const { allOpportunities, isLoading: areOppsLoading, error: oppsError } = useAllOpportunitiesData();
    const { allConversions, isLoading: areConversionsLoading, error: conversionsError } = useAllConversionsData();

    const [period, setPeriod] = useState(30);

    const commissionLedger = useMemo(() => computeAgencyCommissions(customers), [customers]);

    const handleExportBordereaux = () => {
        const csv = buildBordereauxCsv(commissionLedger);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Carrier-Bordereaux-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addNotification('Exported Carrier Commission Bordereaux CSV statement', 'success');
    };

    const isLoading =
        isExecutiveLoading ||
        isAnalyticsLoading ||
        isCampaignsLoading ||
        isKpiLoading ||
        areLeadsLoading ||
        arePerfLoading ||
        areFunnelRunsLoading ||
        areOppsLoading ||
        areConversionsLoading;
    const error =
        executiveError ||
        analyticsError ||
        campaignsError ||
        kpiError ||
        leadsError ||
        perfError ||
        funnelRunsError ||
        oppsError ||
        conversionsError;

    const filteredSnapshots = useMemo(() => {
        if (!allKpiSnapshots) return [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);
        return allKpiSnapshots.filter((s) => {
            const snapshotDate = new Date(s.date);
            return snapshotDate >= startDate && snapshotDate <= endDate;
        });
    }, [allKpiSnapshots, period]);

    const leadsFromCrossSell = useMemo(() => {
        if (!allConversions) return 0;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        return allConversions.filter((c) => {
            const convDate = new Date(c.date);
            return (
                convDate >= startDate &&
                convDate <= endDate &&
                c.kind === 'lead' &&
                c.utm_source === 'email' &&
                c.utm_campaign.includes('cross-sell')
            );
        }).length;
    }, [allConversions, period]);

    const pipelineValue = useMemo(() => {
        if (!allOpportunities) return 0;
        return allOpportunities
            .filter((opp) => opp.stage !== 'won' && opp.stage !== 'lost')
            .reduce((sum, opp) => sum + opp.value, 0);
    }, [allOpportunities]);

    const averageReplyTime = useMemo(() => {
        const relevantSnapshots = filteredSnapshots.filter(
            (s) => s.avgTimeToFirstReplyH !== undefined
        );
        if (relevantSnapshots.length === 0) return 0;
        const totalHours = relevantSnapshots.reduce(
            (sum, s) => sum + s.avgTimeToFirstReplyH!,
            0
        );
        return totalHours / relevantSnapshots.length;
    }, [filteredSnapshots]);

    const micrositeFunnelRate = useMemo(() => {
        if (!allFunnelRuns) return { rate: '0.0', leads: 0, pageviews: 0 };
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        const relevantRuns = allFunnelRuns.filter((run) => {
            const runDate = new Date(run.date);
            return runDate >= startDate && runDate <= endDate;
        });

        const totalLeads = relevantRuns.reduce((sum, run) => sum + run.leads, 0);
        const totalPageviews = relevantRuns.reduce((sum, run) => sum + run.pageviews, 0);
        const rate =
            totalPageviews > 0 ? ((totalLeads / totalPageviews) * 100).toFixed(1) : '0.0';

        return { rate, leads: totalLeads, pageviews: totalPageviews };
    }, [allFunnelRuns, period]);

    const totalGwpWon = useMemo(() => {
        const snapshotGwp = filteredSnapshots
            .filter((snapshot) => snapshot.source === 'Platform Marketing Leads')
            .reduce((sum, snapshot) => sum + snapshot.won.gwp, 0);
        return snapshotGwp + commissionLedger.totalPortfolioGwp;
    }, [filteredSnapshots, commissionLedger.totalPortfolioGwp]);

    const leadToWonRate = useMemo(() => {
        if (!allLeads) return { rate: '0.0', wonCount: 0, leadCount: 0 };
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        const wonCount = filteredSnapshots.reduce((sum, s) => sum + s.won.count, 0);
        const leadCount = allLeads.filter(
            (l) => new Date(l.createdAt) >= startDate && new Date(l.createdAt) <= endDate
        ).length;
        const rate = leadCount > 0 ? ((wonCount / leadCount) * 100).toFixed(1) : '0.0';

        return { rate, wonCount, leadCount };
    }, [filteredSnapshots, allLeads, period]);

    const averageCpa = useMemo(() => {
        if (!allPerformanceSamples) return { cpa: 0, spend: 0, won: 0 };
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        const totalSpend = allPerformanceSamples
            .filter((s) => {
                const sampleDate = new Date(s.date);
                return sampleDate >= startDate && sampleDate <= endDate;
            })
            .reduce((sum, s) => sum + s.spend, 0);

        const totalWonCount = filteredSnapshots.reduce((sum, s) => sum + s.won.count, 0);
        const cpa = totalWonCount > 0 ? totalSpend / totalWonCount : 0;

        return { cpa, spend: totalSpend, won: totalWonCount };
    }, [filteredSnapshots, allPerformanceSamples, period]);

    const campaignKpis = useMemo(() => {
        if (!analyticsData || !campaigns)
            return { totalSpend: 0, totalImpressions: 0, ctr: 0, totalConversions: 0 };

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {t('nav.executiveAnalytics') as string}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Agency GWP, Carrier Bordereaux Commissions, and Acquisition Economics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {t('campaignAnalytics.filters.period')}
                    </label>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(parseInt(e.target.value, 10))}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg"
                    >
                        <option value={7}>{t('campaignAnalytics.filters.last7')}</option>
                        <option value={30}>{t('campaignAnalytics.filters.last30')}</option>
                        <option value={90}>{t('campaignAnalytics.filters.last90')}</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <SkeletonLoader key={i} className="h-24 w-full" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        title={t('executive.kpis.totalGwpWon')}
                        value={`€${totalGwpWon.toLocaleString('el-GR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`}
                        subtitle={t('executive.kpis.totalGwpWonSubtitle')}
                        variant="success"
                    />
                    <KpiCard
                        title={t('executive.kpis.pipelineValue')}
                        value={`€${pipelineValue.toLocaleString('el-GR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}`}
                        subtitle={t('executive.kpis.pipelineValueSubtitle')}
                        variant="success"
                    />
                    <KpiCard
                        title={t('executive.kpis.leadToWonRate')}
                        value={`${leadToWonRate.rate}%`}
                        subtitle={t('executive.kpis.leadToWonRateSubtitle', {
                            wonCount: leadToWonRate.wonCount,
                            leadCount: leadToWonRate.leadCount,
                        })}
                    />
                    <KpiCard
                        title={t('executive.kpis.avgCpa')}
                        value={`€${averageCpa.cpa.toLocaleString('el-GR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`}
                        subtitle={t('executive.kpis.avgCpaSubtitle', {
                            spend: averageCpa.spend.toLocaleString('el-GR'),
                            count: averageCpa.won,
                        })}
                    />
                    <KpiCard
                        title={t('executive.kpis.micrositeFunnelRate')}
                        value={`${micrositeFunnelRate.rate}%`}
                        subtitle={t('executive.kpis.micrositeFunnelRateSubtitle', {
                            leads: micrositeFunnelRate.leads,
                            pageviews: micrositeFunnelRate.pageviews,
                        })}
                        variant="info"
                    />
                    <KpiCard
                        title={t('executive.kpis.avgReplyTime')}
                        value={`${averageReplyTime.toFixed(1)} hrs`}
                        subtitle={t('executive.kpis.avgReplyTimeSubtitle')}
                        variant="info"
                    />
                    <KpiCard
                        title={t('executive.kpis.crossSellLeads')}
                        value={leadsFromCrossSell}
                        subtitle={t('executive.kpis.crossSellLeadsSubtitle')}
                    />
                    <KpiCard
                        title={t('campaignAnalytics.kpis.totalSpend')}
                        value={`€${campaignKpis.totalSpend.toLocaleString('el-GR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`}
                    />
                </div>
            )}

            {/* Carrier Commission & Sub-Agent Bordereaux Reconciliation */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Carrier Commission &amp; Sub-Agent Bordereaux Ledger
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Live commission accounting across bound CRM policies (60% Brokerage Retained / 40% Producer Split).
                        </p>
                    </div>
                    <button
                        onClick={handleExportBordereaux}
                        className="px-3.5 py-2 text-xs font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Export Bordereaux CSV
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-gray-50/70 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700 tabular-nums">
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider block">
                            Active Book GWP
                        </span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            €{commissionLedger.totalPortfolioGwp.toFixed(2)}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider block">
                            Gross Carrier Commissions
                        </span>
                        <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                            €{commissionLedger.totalGrossCommission.toFixed(2)}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider block">
                            Sub-Agent Split (40%)
                        </span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            €{commissionLedger.totalSubAgentPayout.toFixed(2)}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider block">
                            Net Brokerage Revenue (60%)
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            €{commissionLedger.totalAgencyNetRetained.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm tabular-nums">
                        <thead className="bg-gray-50 dark:bg-gray-900/40 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="px-5 py-3 text-left">Policy #</th>
                                <th className="px-5 py-3 text-left">Policyholder</th>
                                <th className="px-5 py-3 text-left">Carrier &amp; Line</th>
                                <th className="px-5 py-3 text-right">Gross GWP</th>
                                <th className="px-5 py-3 text-right">Gross Comm.</th>
                                <th className="px-5 py-3 text-right">Producer (40%)</th>
                                <th className="px-5 py-3 text-right">Agency Net (60%)</th>
                                <th className="px-5 py-3 text-right">Settlement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
                            {commissionLedger.rows.map((row) => (
                                <tr
                                    key={row.policyId}
                                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30"
                                >
                                    <td className="px-5 py-3 font-mono text-xs font-semibold text-gray-900 dark:text-white">
                                        {row.policyNumber}
                                    </td>
                                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-gray-200">
                                        {row.customerName}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                                        {row.insurer} •{' '}
                                        <span className="uppercase text-xs">{row.policyType}</span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        €{row.grossPremium.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-3 text-right font-medium">
                                        €{row.grossCommission.toFixed(2)}{' '}
                                        <span className="text-xs text-gray-400">
                                            ({Math.round(row.commissionRate * 100)}%)
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right text-gray-600 dark:text-gray-300">
                                        €{row.subAgentSplitEuro.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                                        €{row.agencyNetRetainedEuro.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <span
                                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                row.settlementStatus === 'Matched'
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                    : 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                            }`}
                                        >
                                            {row.settlementStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700">
                Portfolio &amp; Funnel Analytics
            </h2>
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <SkeletonLoader className="h-80 w-full" />
                    <SkeletonLoader className="h-80 w-full" />
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