import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useCampaigns } from '../hooks/useCampaigns';
import { useCrmData } from '../hooks/useCrmData';
import { usePipelineData } from '../hooks/usePipelineData';
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
    const { leads } = useCrmData();
    const { conversions } = usePipelineData();

    const [filters, setFilters] = useState({
        campaignId: 'all',
        network: 'all',
        period: 90,
        language: 'all' as 'all' | Language,
    });

    const isLoading = isAnalyticsLoading || isCampaignsLoading;
    const error = analyticsError || campaignsError;

    const filteredData = useMemo(() => {
        if (!analyticsData || !campaigns) return [];

        const campaignMap: Map<string, Campaign> = new Map(campaigns.map((c) => [c.id, c]));
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - filters.period);

        return analyticsData.filter((d) => {
            const campaign = campaignMap.get(d.campaignId);
            if (!campaign) return false;

            const recordDate = new Date(d.date);
            const isAfterStartDate = recordDate >= startDate;

            const campaignMatch =
                filters.campaignId === 'all' || d.campaignId === filters.campaignId;
            const networkMatch = filters.network === 'all' || campaign.network === filters.network;
            const languageMatch =
                filters.language === 'all' || campaign.language === filters.language;

            return isAfterStartDate && campaignMatch && networkMatch && languageMatch;
        });
    }, [analyticsData, campaigns, filters]);

    const aggregatedData = useMemo(() => {
        const campaignMap: Map<string, Campaign> = new Map(campaigns.map((c) => [c.id, c]));

        const totalSpend = filteredData.reduce((sum, d) => sum + d.spend, 0);
        const totalImpressions = filteredData.reduce((sum, d) => sum + d.impressions, 0);
        const totalClicks = filteredData.reduce((sum, d) => sum + d.clicks, 0);
        const totalConversions = filteredData.reduce((sum, d) => sum + d.conversions, 0);
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        const spendByNetwork = filteredData.reduce((acc: Record<string, number>, d) => {
            const network = campaignMap.get(d.campaignId)?.network || 'unknown';
            acc[network] = (acc[network] || 0) + d.spend;
            return acc;
        }, {});

        const performanceOverTime = filteredData.reduce(
            (
                acc: Record<
                    string,
                    { date: string; impressions: number; clicks: number; conversions: number }
                >,
                d
            ) => {
                if (!acc[d.date]) {
                    acc[d.date] = { date: d.date, impressions: 0, clicks: 0, conversions: 0 };
                }
                acc[d.date].impressions += d.impressions;
                acc[d.date].clicks += d.clicks;
                acc[d.date].conversions += d.conversions;
                return acc;
            },
            {}
        );

        return {
            totalSpend,
            totalImpressions,
            totalClicks,
            totalConversions,
            ctr,
            spendByNetwork: Object.entries(spendByNetwork).map(([name, spend]) => ({
                name,
                spend,
            })),
            performanceOverTime: Object.values(performanceOverTime).sort(
                (a: { date: string }, b: { date: string }) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            ),
        };
    }, [filteredData, campaigns]);

    // Closed-loop CRM & Bound GWP ROAS Attribution per Campaign
    const campaignAttributionRows = useMemo(() => {
        const boundGwpTotal = conversions
            .filter((c) => c.kind === 'won')
            .reduce((sum, c) => sum + (c.value || 0), 0);

        return campaigns.map((camp) => {
            const spend = (analyticsData || [])
                .filter((d) => d.campaignId === camp.id)
                .reduce((s, d) => s + d.spend, 0);
            const matchedLeads = leads.filter(
                (l) => l.campaignId === camp.id || l.source === camp.name
            );
            const pipelineGwp = matchedLeads.reduce(
                (s, l) => s + (Number(l.potentialValue) || 350),
                0
            );
            const effectiveAttributedValue =
                pipelineGwp + (campaigns.length > 0 ? boundGwpTotal / campaigns.length : 0);
            const roas = spend > 0 ? effectiveAttributedValue / spend : 0;

            return {
                id: camp.id,
                name: camp.name,
                network: camp.network,
                spend,
                crmLeadsCount: matchedLeads.length,
                attributedGwp: effectiveAttributedValue,
                roas,
            };
        });
    }, [campaigns, analyticsData, leads, conversions]);

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {t('campaignAnalytics.title') as string}
            </h1>

            {isLoading ? (
                <SkeletonLoader className="h-24 w-full" />
            ) : (
                <AnalyticsFilters
                    campaigns={campaigns}
                    filters={filters}
                    onFilterChange={setFilters}
                />
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <SkeletonLoader key={i} className="h-24 w-full" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        title={t('campaignAnalytics.kpis.totalSpend') as string}
                        value={`€${aggregatedData.totalSpend.toLocaleString('el-GR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`}
                    />
                    <KpiCard
                        title={t('campaignAnalytics.kpis.totalImpressions') as string}
                        value={aggregatedData.totalImpressions.toLocaleString('el-GR')}
                    />
                    <KpiCard
                        title={t('campaignAnalytics.kpis.ctr') as string}
                        value={`${aggregatedData.ctr.toFixed(2)}%`}
                    />
                    <KpiCard
                        title={t('campaignAnalytics.kpis.totalConversions') as string}
                        value={aggregatedData.totalConversions.toLocaleString('el-GR')}
                    />
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SkeletonLoader className="h-80 w-full lg:col-span-2" />
                    <SkeletonLoader className="h-80 w-full" />
                </div>
            ) : filteredData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <PerformanceChart data={aggregatedData.performanceOverTime} />
                    </div>
                    <div>
                        <SpendChart data={aggregatedData.spendByNetwork} />
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500">
                        {t('campaignAnalytics.noData') as string}
                    </p>
                </div>
            )}

            {/* Closed-Loop CRM & Bound GWP Attribution Table */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Closed-Loop Campaign Attribution (Ad Spend → Bound GWP)
                        </h2>
                        <p className="text-xs text-gray-500">
                            Joins paid acquisition spend with live CRM Lead values and bound pipeline policies.
                        </p>
                    </div>
                    <Link
                        to="/ad-campaigns"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Manage Campaigns →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm tabular-nums">
                        <thead className="bg-gray-50 dark:bg-gray-900/40 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="px-5 py-3 text-left">Campaign</th>
                                <th className="px-5 py-3 text-left">Network</th>
                                <th className="px-5 py-3 text-right">Ad Spend</th>
                                <th className="px-5 py-3 text-right">CRM Leads</th>
                                <th className="px-5 py-3 text-right">Attributed GWP</th>
                                <th className="px-5 py-3 text-right">True ROAS</th>
                                <th className="px-5 py-3 text-right">Landing Funnel</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
                            {campaignAttributionRows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30"
                                >
                                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">
                                        {row.name}
                                    </td>
                                    <td className="px-5 py-3.5 capitalize text-gray-600 dark:text-gray-300">
                                        {row.network}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        €{row.spend.toFixed(2)}
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-medium">
                                        {row.crmLeadsCount}
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                                        €{row.attributedGwp.toFixed(0)}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span
                                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                row.roas >= 3
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {row.roas.toFixed(1)}x
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <Link
                                            to={`/campaign/lead/${row.id}`}
                                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Preview Funnel
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Analytics;
