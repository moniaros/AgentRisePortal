import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { fetchGbpData } from '../services/api';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { GbpLocationSummary, GbpReview, GbpStarRating } from '../types';
import StarRating from '../components/ui/StarRating';

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
    const { t, language } = useLocalization();
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

    const formattedDate = new Date().toLocaleDateString(language, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SkeletonLoader className="h-24 w-full" />
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
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        {summary?.title || 'Dashboard'}
                    </h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{formattedDate}</p>
                </div>
            </header>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-around gap-6">
                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-4xl font-bold">{summary?.averageRating.toFixed(1)}</p>
                        <StarRating rating={summary?.averageRating || 0} />
                    </div>
                </div>
                <div className="h-16 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                 <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
                    <p className="text-4xl font-bold mt-1">{summary?.totalReviewCount}</p>
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-semibold mb-4">Recent Reviews</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map(review => <ReviewCard key={review.name} review={review} />)}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;