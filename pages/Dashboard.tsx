import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { fetchGbpData } from '../services/api';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { GbpLocationSummary, GbpReview } from '../types';
import BusinessHeader from '../components/dashboard/BusinessHeader';
import ReviewFeed from '../components/dashboard/ReviewFeed';

const Dashboard: React.FC = () => {
    const { t } = useLocalization();
    const navigate = useNavigate();

    const [summary, setSummary] = useState<GbpLocationSummary | null>(null);
    const [reviews, setReviews] = useState<GbpReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const locationName = localStorage.getItem('gbp_location_name');
        const gapi = (window as any).gapi;

        if (!locationName || !gapi?.auth2?.getAuthInstance()?.isSignedIn.get()) {
            navigate('/settings');
            return;
        }

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetchGbpData(locationName);
                setSummary(result.summary);
                setReviews(result.reviews);
            } catch (err) {
                setError(t('dashboard.errors.dataFetchFailed') as string);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [navigate, t]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SkeletonLoader className="h-28 w-full" />
                <div className="flex justify-between items-center">
                    <SkeletonLoader className="h-12 w-1/3" />
                    <SkeletonLoader className="h-6 w-1/4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonLoader className="h-48 w-full" />
                    <SkeletonLoader className="h-48 w-full" />
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
            <BusinessHeader summary={summary} />
            <ReviewFeed reviews={reviews} setReviews={setReviews} />
        </div>
    );
};

export default Dashboard;