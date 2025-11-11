import React from 'react';
import { GbpLocationSummary } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import StarRating from '../ui/StarRating';

interface BusinessHeaderProps {
    summary: GbpLocationSummary | null;
}

const BusinessHeader: React.FC<BusinessHeaderProps> = ({ summary }) => {
    const { t } = useLocalization();

    if (!summary) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Business Name */}
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white" aria-label="Business Name">
                    {summary.title}
                </h1>

                {/* Rating and Reviews */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2" aria-label={`Average rating: ${summary.averageRating} out of 5 stars`}>
                        <span className="text-xl font-bold text-gray-800 dark:text-white">{summary.averageRating.toFixed(1)}</span>
                        <StarRating rating={summary.averageRating} />
                    </div>
                    <span className="hidden sm:block text-gray-300 dark:text-gray-600">|</span>
                    <p className="text-sm" aria-label={`Total reviews: ${summary.totalReviewCount}`}>
                        {t('dashboard.basedOn')} {summary.totalReviewCount.toLocaleString()} {t('dashboard.reviews')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BusinessHeader;
