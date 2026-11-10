import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { fetchGbpData } from '../services/api';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { GbpLocationSummary, GbpReview, TransactionInquiry } from '../types';
import BusinessHeader from '../components/dashboard/BusinessHeader';
import ReviewFeed from '../components/dashboard/ReviewFeed';
import { useInquiriesData } from '../hooks/useInquiriesData';
import { useOpportunitiesData } from '../hooks/useOpportunitiesData';
import { useInteractionsData } from '../hooks/useInteractionsData';
import { useFtnolData } from '../hooks/useFtnolData';
import { useServiceRequestsData } from '../hooks/useServiceRequestsData';
import { usePerformanceData } from '../hooks/usePerformanceData';
import KpiCard from '../components/analytics/KpiCard';
import { usePortalAccountsData } from '../hooks/usePortalAccountsData';
import OnboardingWidget from '../components/dashboard/OnboardingWidget';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useAllVerifiedOpportunities } from '../hooks/useAllVerifiedOpportunities';
import { useCrmData } from '../hooks/useCrmData';
import { usePipelineData } from '../hooks/usePipelineData';
import { useNotification } from '../hooks/useNotification';
import { computeRenewalRadar, RenewalRadarItem } from '../lib/renewalEngine';

const Dashboard: React.FC = () => {
    const { t } = useLocalization();
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const POOR_CPL_THRESHOLD = 50;

    const [summary, setSummary] = useState<GbpLocationSummary | null>(null);
    const [reviews, setReviews] = useState<GbpReview[]>([]);
    const [isGbpLoading, setIsGbpLoading] = useState(true);
    const [gbpError, setGbpError] = useState<string | null>(null);
    const [renewalFilter, setRenewalFilter] = useState<'all' | 'overdue' | 'due30' | 'due90'>('all');

    const { inquiries, isLoading: isInquiriesLoading, error: inquiriesError } = useInquiriesData();
    const { opportunities, isLoading: isOppsLoading, error: oppsError } = useOpportunitiesData();
    const { interactions, isLoading: areInteractionsLoading, error: interactionsError } = useInteractionsData();
    const { ftnol, isLoading: isFtnolLoading, error: ftnolError } = useFtnolData();
    const { serviceRequests, isLoading: areServiceRequestsLoading, error: serviceRequestsError } = useServiceRequestsData();
    const { performanceSamples, isLoading: isPerfLoading, error: perfError } = usePerformanceData();
    const { portalAccounts, isLoading: arePortalAccountsLoading, error: portalAccountsError } = usePortalAccountsData();
    const { upsellCount, crossSellCount, isLoading: opportunitiesLoading } = useAllVerifiedOpportunities();
    const { customers } = useCrmData();
    const { createOpportunity } = usePipelineData();

    const renewalRadar = useMemo(() => computeRenewalRadar(customers), [customers]);

    const displayedRenewals = useMemo(() => {
        if (renewalFilter === 'overdue') return renewalRadar.overdue;
        if (renewalFilter === 'due30') return renewalRadar.due30;
        if (renewalFilter === 'due90') return [...renewalRadar.due60, ...renewalRadar.due90];
        return renewalRadar.allActionable;
    }, [renewalRadar, renewalFilter]);

    const handleReshopRenewal = (item: RenewalRadarItem) => {
        const [firstName, ...rest] = item.customerName.split(' ');
        const lastName = rest.join(' ') || 'Client';
        const renewalInquiry: TransactionInquiry = {
            id: `inq_ren_${Date.now()}`,
            agencyId: 'agency_1',
            createdAt: new Date().toISOString(),
            contact: {
                firstName,
                lastName,
                email: item.customerEmail,
                phone: item.customerPhone,
            },
            consentGDPR: true,
            source: 'T-90 Renewal Radar',
            purpose: 'quote_request',
            attribution: { utm_source: 'renewal_radar', utm_medium: 'retention' },
            attributionId: item.policyId,
            policyType: item.policyType,
            details: `Renewal re-shop for ${item.insurer} policy #${item.policyNumber} (expiring ${item.endDate})`,
        };
        const deal = createOpportunity(renewalInquiry, item.premium);
        if (deal) {
            addNotification(
                `Opened comparative renewal deal for ${item.customerName} (#${item.policyNumber})`,
                'success'
            );
            navigate('/pipeline/board');
        }
    };

    const activePortalUsersToday = useMemo(() => {
        if (!portalAccounts) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return portalAccounts.filter((account) => {
            const loginDate = new Date(account.lastLoginAt);
            return loginDate >= today;
        }).length;
    }, [portalAccounts]);

    const adPerformanceToday = useMemo(() => {
        if (!performanceSamples) return { spend: 0, leads: 0, cpl: 0, isPoor: false };
        const today = new Date().toISOString().split('T')[0];

        const todaysSamples = performanceSamples.filter((s) => s.date.startsWith(today));

        const spend = todaysSamples.reduce((sum, s) => sum + s.spend, 0);
        const leads = todaysSamples.reduce((sum, s) => sum + s.conversions.lead, 0);

        const cpl = leads > 0 ? spend / leads : spend;
        const isPoor = cpl > POOR_CPL_THRESHOLD;

        return { spend, leads, cpl, isPoor };
    }, [performanceSamples]);

    const newInquiriesToday = useMemo(() => {
        if (!inquiries) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return inquiries.filter((inquiry) => {
            const inquiryDate = new Date(inquiry.createdAt);
            return inquiryDate >= today;
        }).length;
    }, [inquiries]);

    const overdueFollowUps = useMemo(() => {
        if (!opportunities) return 0;
        const now = new Date();
        return opportunities.filter((opp) => {
            if (!opp.nextFollowUpDate) return false;
            const followUpDate = new Date(opp.nextFollowUpDate);
            const isPast = followUpDate < now;
            const isOpen = opp.stage !== 'won' && opp.stage !== 'lost';
            return isPast && isOpen;
        }).length;
    }, [opportunities]);

    const unreadMessages = useMemo(() => {
        if (!interactions) return 0;
        return interactions.filter(
            (interaction) => interaction.direction === 'inbound' && !interaction.read
        ).length;
    }, [interactions]);

    const newPortalSubmissions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newFtnol = ftnol.filter((f) => new Date(f.createdAt) >= today).length;
        const newRequests = serviceRequests.filter((r) => new Date(r.createdAt) >= today).length;

        return newFtnol + newRequests;
    }, [ftnol, serviceRequests]);

    useEffect(() => {
        const locationName = localStorage.getItem('gbp_location_name');

        if (!locationName) {
            setIsGbpLoading(false);
            return;
        }

        const loadData = async () => {
            setIsGbpLoading(true);
            setGbpError(null);
            try {
                const result = await fetchGbpData(locationName);
                setSummary(result.summary);
                setReviews(result.reviews);
            } catch (err) {
                setGbpError(t('dashboard.errors.dataFetchFailed') as string);
                console.error(err);
            } finally {
                setIsGbpLoading(false);
            }
        };
        loadData();
    }, [t]);

    const isLoading =
        isGbpLoading ||
        isInquiriesLoading ||
        isOppsLoading ||
        areInteractionsLoading ||
        isFtnolLoading ||
        areServiceRequestsLoading ||
        isPerfLoading ||
        arePortalAccountsLoading ||
        opportunitiesLoading;
    const error =
        gbpError ||
        inquiriesError?.message ||
        oppsError?.message ||
        interactionsError?.message ||
        ftnolError?.message ||
        serviceRequestsError?.message ||
        perfError?.message ||
        portalAccountsError?.message;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <DashboardHeader />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <SkeletonLoader key={i} className="h-24 w-full" />
                    ))}
                </div>
                <SkeletonLoader className="h-48 w-full" />
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error as string} />;
    }

    return (
        <div className="space-y-6">
            <DashboardHeader />
            <OnboardingWidget />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title={t('dashboard.kpis.newInquiriesToday')}
                    value={newInquiriesToday}
                    subtitle={t('dashboard.kpis.newInquiriesSubtitle')}
                />
                <KpiCard
                    title={t('dashboard.kpis.overdueFollowUps')}
                    value={overdueFollowUps}
                    subtitle={t('dashboard.kpis.overdueFollowUpsSubtitle')}
                    variant="danger"
                />
                <KpiCard
                    title={t('dashboard.kpis.unreadMessages')}
                    value={unreadMessages}
                    subtitle={t('dashboard.kpis.unreadMessagesSubtitle')}
                    variant="info"
                />
                <KpiCard
                    title={t('dashboard.kpis.newPortalSubmissions')}
                    value={newPortalSubmissions}
                    subtitle={t('dashboard.kpis.newPortalSubmissionsSubtitle')}
                    variant="success"
                />
                <KpiCard
                    title={t('dashboard.kpis.adPerformance')}
                    value={`€${adPerformanceToday.cpl.toFixed(2)}`}
                    subtitle={t('dashboard.kpis.adPerformanceSubtitle', {
                        leads: adPerformanceToday.leads,
                        spend: adPerformanceToday.spend.toFixed(2),
                    })}
                    variant={adPerformanceToday.isPoor ? 'danger' : 'default'}
                />
                <KpiCard
                    title={t('dashboard.kpis.activePortalUsers')}
                    value={activePortalUsersToday}
                    subtitle={t('dashboard.kpis.activePortalUsersSubtitle')}
                />
                <Link to="/opportunities-hub" className="block">
                    <KpiCard
                        title={t('dashboard.kpis.upsellOpportunities')}
                        value={upsellCount}
                        subtitle={t('dashboard.kpis.viewAll')}
                        variant="info"
                    />
                </Link>
                <Link to="/opportunities-hub" className="block">
                    <KpiCard
                        title={t('dashboard.kpis.crossSellOpportunities')}
                        value={crossSellCount}
                        subtitle={t('dashboard.kpis.viewAll')}
                        variant="info"
                    />
                </Link>
            </div>

            {/* Automated T-90 Policy Renewal & Retention Radar */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Policy Renewal &amp; Retention Radar (T-90)
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 tabular-nums">
                            {renewalRadar.allActionable.length} policies requiring retention outreach •
                            €{renewalRadar.totalAtRiskGwp.toFixed(2)} annual GWP in window
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {(
                            [
                                { id: 'all', label: `All (${renewalRadar.allActionable.length})` },
                                { id: 'overdue', label: `Overdue (${renewalRadar.overdue.length})` },
                                { id: 'due30', label: `≤30 Days (${renewalRadar.due30.length})` },
                                {
                                    id: 'due90',
                                    label: `31–90 Days (${
                                        renewalRadar.due60.length + renewalRadar.due90.length
                                    })`,
                                },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setRenewalFilter(tab.id)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors tabular-nums ${
                                    renewalFilter === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {displayedRenewals.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No renewals in this bucket. All policies in this window are up to date.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/40 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-5 py-3 text-left">Policyholder</th>
                                    <th className="px-5 py-3 text-left">Policy &amp; Carrier</th>
                                    <th className="px-5 py-3 text-left">Window</th>
                                    <th className="px-5 py-3 text-right">Annual GWP</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70 tabular-nums">
                                {displayedRenewals.map((item) => (
                                    <tr
                                        key={`${item.customerId}-${item.policyId}`}
                                        className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <Link
                                                to={`/customer/${item.customerId}`}
                                                className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                                            >
                                                {item.customerName}
                                            </Link>
                                            <span className="block text-xs text-gray-500">
                                                {item.recommendedAction}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                                {item.insurer} • #{item.policyNumber}
                                            </span>
                                            <span className="block text-xs uppercase text-gray-500">
                                                {item.policyType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                                                    item.bucket === 'overdue'
                                                        ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                        : item.bucket === 'due30'
                                                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                }`}
                                            >
                                                {item.daysRemaining < 0
                                                    ? `${Math.abs(item.daysRemaining)}d overdue`
                                                    : `In ${item.daysRemaining}d (${item.endDate})`}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold text-gray-900 dark:text-white">
                                            €{item.premium.toFixed(2)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button
                                                onClick={() => handleReshopRenewal(item)}
                                                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Re-Shop in Pipeline
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {summary && <BusinessHeader summary={summary} />}
            {reviews.length > 0 && <ReviewFeed reviews={reviews} setReviews={setReviews} />}
        </div>
    );
};

export default Dashboard;