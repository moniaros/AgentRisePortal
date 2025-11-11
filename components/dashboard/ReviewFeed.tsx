import React, { useState, useMemo } from 'react';
import { GbpReview } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import ReviewCard from './ReviewCard';

interface ReviewFeedProps {
    reviews: GbpReview[];
    setReviews: React.Dispatch<React.SetStateAction<GbpReview[]>>;
}

const ReviewFeed: React.FC<ReviewFeedProps> = ({ reviews, setReviews }) => {
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

    const handleReplyPosted = (reviewId: string, replyText: string) => {
        setReviews(prevReviews =>
            prevReviews.map(r => {
                if (r.name === reviewId) {
                    return {
                        ...r,
                        reply: {
                            comment: replyText,
                            updateTime: new Date().toISOString(),
                        },
                    };
                }
                return r;
            })
        );
    };

    const renderEmptyState = () => {
        let message = '';
        if (reviews.length === 0) {
            message = t('dashboard.emptyStates.noReviews');
        } else if (filteredAndSortedReviews.length === 0 && showOnlyUnreplied) {
            message = t('dashboard.emptyStates.allReplied');
        }

        if (message) {
            return (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">{message}</p>
                </div>
            );
        }
        return null;
    }

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
            {filteredAndSortedReviews.length > 0 ? (
                <div className="space-y-6">
                    {filteredAndSortedReviews.map(review => (
                        <ReviewCard key={review.name} review={review} onReplyPosted={handleReplyPosted} />
                    ))}
                </div>
            ) : (
                renderEmptyState()
            )}
        </div>
    );
};

export default ReviewFeed;