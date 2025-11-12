import React, { useEffect, useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
// FIX: Correct import path
import { fetchGbpData } from '../services/api';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
// FIX: Correct import path
import { GbpLocationSummary, GbpReview } from '../types';
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

const Dashboard: React.FC = () => {
    const { t } = useLocalization();
    const POOR_CPL_THRESHOLD = 50;

    const [summary, setSummary] = useState<GbpLocationSummary | null>(null);
    const [reviews, setReviews] = useState<GbpReview[]>([]);
    const [isGbpLoading, setIsGbpLoading] = useState(true);
    const [gbpError, setGbpError] = useState<string | null>(null);

    const { inquiries, isLoading: isInquiriesLoading, error: inquiriesError } = useInquiriesData();
    const { opportunities, isLoading: isOppsLoading, error: oppsError } = useOpportunitiesData();
    const { interactions, isLoading: areInteractionsLoading, error: interactionsError } = useInteractionsData();
    const { ftnol, isLoading: isFtnolLoading, error: ftnolError } = useFtnolData();
    const { serviceRequests, isLoading: areServiceRequestsLoading, error: serviceRequestsError } = useServiceRequestsData();
    const { performanceSamples, isLoading: isPerfLoading, error: perfError } = usePerformanceData();
    const { portalAccounts, isLoading: arePortalAccountsLoading, error: portalAccountsError } = usePortalAccountsData();

    const activePortalUsersToday = useMemo(() => {
        if (!portalAccounts) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return portalAccounts.filter(account => {
            const loginDate = new Date(account.lastLoginAt);
            return loginDate >= today;
        }).length;
    }, [portalAccounts]);

    const adPerformanceToday = useMemo(() => {
        if (!performanceSamples) return { spend: 0, leads: 0, cpl: 0, isPoor: false };
        const today = new Date().toISOString().split('T')[0];

        const todaysSamples = performanceSamples.filter(s => s.date.startsWith(today));
        
        const spend = todaysSamples.reduce((sum, s) => sum + s.spend, 0);
        const leads = todaysSamples.reduce((sum, s) => sum + s.conversions.lead, 0);
        
        const cpl = leads > 0 ? spend / leads : spend;
        const isPoor = cpl > POOR_CPL_THRESHOLD;

        return { spend, leads, cpl, isPoor };
    }, [performanceSamples]);

    const newInquiriesToday = useMemo(() => {
        if (!inquiries) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        return inquiries.filter(inquiry => {
            const inquiryDate = new Date(inquiry.createdAt);
            return inquiryDate >= today;
        }).length;
    }, [inquiries]);
    
    const overdueFollowUps = useMemo(() => {
        if (!opportunities) return 0;
        const now = new Date();
        return opportunities.filter(opp => {
            const followUpDate = new Date(opp.nextFollowUpDate);
            const isPast = followUpDate < now;
            const isOpen = opp.stage !== 'won' && opp.stage !== 'lost';
            return isPast && isOpen;
        }).length;
    }, [opportunities]);

    const unreadMessages = useMemo(() => {
        if (!interactions) return 0;
        return interactions.filter(interaction => interaction.direction === 'inbound' && !interaction.read).length;
    }, [interactions]);

    const newPortalSubmissions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newFtnol = ftnol.filter(f => new Date(f.createdAt) >= today).length;
        const newRequests = serviceRequests.filter(r => new Date(r.createdAt) >= today).length;
        
        return newFtnol + newRequests;
    }, [ftnol, serviceRequests]);

    useEffect(() => {
        const locationName = localStorage.getItem('gbp_location_name');

        if (!locationName) {
            setIsGbpLoading(false); // If not configured, just stop the GBP loading process.
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

    const isLoading = isGbpLoading || isInquiriesLoading || isOppsLoading || areInteractionsLoading || isFtnolLoading || areServiceRequestsLoading || isPerfLoading || arePortalAccountsLoading;
    const error = gbpError || inquiriesError?.message || oppsError?.message || interactionsError?.message || ftnolError?.message || serviceRequestsError?.message || perfError?.message || portalAccountsError?.message;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, i) => <SkeletonLoader key={i} className="h-24 w-full" />)}
                </div>
                <SkeletonLoader className="h-28 w-full" />
                <div className="flex justify-between items-center">
                    <SkeletonLoader className="h-12 w-1/3" />
                    <SkeletonLoader className="h-6 w-1/4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonLoader className="h-48 w-full" />
                    <SkeletonLoader className="h-48 w-full" />
                </div>
            </div>
        );
    }
    
    if (error) {
        return <ErrorMessage message={error as string} />;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
                    subtitle={t('dashboard.kpis.adPerformanceSubtitle', { leads: adPerformanceToday.leads, spend: adPerformanceToday.spend.toFixed(2) })}
                    variant={adPerformanceToday.isPoor ? 'danger' : 'default'}
                />
                 <KpiCard 
                    title={t('dashboard.kpis.activePortalUsers')} 
                    value={activePortalUsersToday}
                    subtitle={t('dashboard.kpis.activePortalUsersSubtitle')}
                />
            </div>
            
            {summary && <BusinessHeader summary={summary} />}
            {reviews.length > 0 && <ReviewFeed reviews={reviews} setReviews={setReviews} />}
        </div>
    );
};

export default Dashboard;