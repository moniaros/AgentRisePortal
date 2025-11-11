import React, { useState, useMemo } from 'react';
import { GbpReview } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import ReviewCard from './ReviewCard';

interface ReviewFeedProps {
    reviews: GbpReview[];
}

const ReviewFeed: React.FC<ReviewFeedProps> = ({ reviews }) => {
    const { t } = useLocalization();
    const [showOnlyUnreplied, setShowOnlyUnreplied] = useState(true);

    const filteredAndSortedReviews = useMemo(() => {
        return reviews
            .filter(review => {
                if (showOnlyUnreplied) {
                    return !review.reply;
                }
                return true;
            })
            .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    }, [reviews, showOnlyUnreplied]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{t('dashboard.recentReviews')}</h2>
                <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <input
                        type="checkbox"
                        checked={showOnlyUnreplied}
                        onChange={(e) => setShowOnlyUnreplied(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{t('dashboard.showUnreplied')}</span>
                </label>
            </div>
            <div className="space-y-6">
                {filteredAndSortedReviews.map(review => (
                    <ReviewCard key={review.name} review={review} />
                ))}
            </div>
        </div>
    );
};

export default ReviewFeed;