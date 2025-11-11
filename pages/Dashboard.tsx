import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { fetchGbpData } from '../services/api';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { GbpLocationSummary, GbpReview } from '../types';
import BusinessHeader from '../components/dashboard/BusinessHeader';
import ReviewFeed from '../components/dashboard/ReviewFeed';
import { useInquiriesData } from '../hooks/useInquiriesData';
import { useOpportunitiesData } from '../hooks/useOpportunitiesData';
import KpiCard from '../components/analytics/KpiCard';

const Dashboard: React.FC = () => {
    const { t } = useLocalization();
    const navigate = useNavigate();

    const [summary, setSummary] = useState<GbpLocationSummary | null>(null);
    const [reviews, setReviews] = useState<GbpReview[]>([]);
    const [isGbpLoading, setIsGbpLoading] = useState(true);
    const [gbpError, setGbpError] = useState<string | null>(null);

    const { inquiries, isLoading: isInquiriesLoading, error: inquiriesError } = useInquiriesData();
    const { opportunities, isLoading: isOppsLoading, error: oppsError } = useOpportunitiesData();

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

    useEffect(() => {
        const locationName = localStorage.getItem('gbp_location_name');
        const gapi = (window as any).gapi;

        if (!locationName || !gapi?.auth2?.getAuthInstance()?.isSignedIn.get()) {
            navigate('/settings');
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
    }, [navigate, t]);

    const isLoading = isGbpLoading || isInquiriesLoading || isOppsLoading;
    const error = gbpError || inquiriesError?.message || oppsError?.message;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SkeletonLoader className="h-24 w-full" />
                    <SkeletonLoader className="h-24 w-full" />
                    <SkeletonLoader className="h-24 w-full md:col-span-2 lg:col-span-2" />
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
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow-md md:col-span-2 lg:col-span-2 flex items-center justify-center">
                    <p className="text-sm text-gray-500">Other KPI cards coming soon...</p>
                </div>
            </div>
            
            {summary && <BusinessHeader summary={summary} />}
            {reviews.length > 0 && <ReviewFeed reviews={reviews} setReviews={setReviews} />}
        </div>
    );
};

export default Dashboard;