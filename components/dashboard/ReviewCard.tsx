import React from 'react';
import { GbpReview, GbpStarRating } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import StarRating from '../ui/StarRating';

interface ReviewCardProps {
    review: GbpReview;
}

const starRatingMap: Record<GbpStarRating, number> = {
    'FIVE': 5,
    'FOUR': 4,
    'THREE': 3,
    'TWO': 2,
    'ONE': 1,
    'STAR_RATING_UNSPECIFIED': 0,
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    const { t } = useLocalization();
    const rating = starRatingMap[review.starRating] || 0;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            {/* Reviewer Info */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{review.reviewer.displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.createTime).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <StarRating rating={rating} />
                    <span>({rating} {t('dashboard.stars')})</span>
                </div>
            </div>

            {/* Review Comment */}
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">&ldquo;{review.comment}&rdquo;</p>

            {/* Reply Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex justify-end">
                     <button
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        aria-label={`Generate AI reply for ${review.reviewer.displayName}'s review`}
                    >
                        {t('dashboard.generateAiReply')}
                    </button>
                </div>
                <div>
                    <label htmlFor={`reply-${review.name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('dashboard.yourReply')}
                    </label>
                    <textarea
                        id={`reply-${review.name}`}
                        rows={3}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400"
                        placeholder="AI-generated reply will appear here..."
                        readOnly
                        disabled
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled
                    >
                        {t('dashboard.postReply')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;