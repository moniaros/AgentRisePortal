import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { fetchGbpData } from '../services/api';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { GbpLocationSummary, GbpReview, GbpStarRating } from '../types';
import StarRating from '../components/ui/StarRating';
import BusinessHeader from '../components/dashboard/BusinessHeader';

const starRatingMap: Record<GbpStarRating, number> = {
    'FIVE': 5,
    'FOUR': 4,
    'THREE': 3,
    'TWO': 2,
    'ONE': 1,
    'STAR_RATING_UNSPECIFIED': 0,
};

const ReviewCard: React.FC<{ review: GbpReview }> = ({ review }) => {
    const rating = starRatingMap[review.starRating] || 0;
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">{review.reviewer.displayName}</p>
                <StarRating rating={rating} className="h-4 w-4" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">&ldquo;{review.comment}&rdquo;</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-right">{new Date(review.createTime).toLocaleDateString()}</p>
        </div>
    );
};


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

        if (!locationName || !gapi || !gapi.auth2 || !gapi.auth2.getAuthInstance().isSignedIn.get()) {
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
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SkeletonLoader className="h-28 w-full" />
                <SkeletonLoader className="h-12 w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SkeletonLoader className="h-32 w-full" />
                    <SkeletonLoader className="h-32 w-full" />
                    <SkeletonLoader className="h-32 w-full" />
                    <SkeletonLoader className="h-32 w-full" />
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
            
            <div>
                <h2 className="text-2xl font-semibold mb-4">{t('dashboard.recentReviews')}</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map(review => <ReviewCard key={review.name} review={review} />)}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;