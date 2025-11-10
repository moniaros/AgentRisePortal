import React from 'react';
import { Testimonial } from '../../types';
import StarRating from '../ui/StarRating';
import { useLocalization } from '../../hooks/useLocalization';

interface ModerationCardProps {
    testimonial: Testimonial;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

const ModerationCard: React.FC<ModerationCardProps> = ({ testimonial, onApprove, onReject }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg shadow-md border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center justify-between mb-2">
                <StarRating rating={testimonial.rating} />
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(testimonial.createdAt).toLocaleDateString()}</p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.quote}"</p>
            <p className="font-semibold text-sm text-right mt-2">- {testimonial.authorName}</p>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
                <button onClick={() => onReject(testimonial.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                    {t('testimonials.reject')}
                </button>
                <button onClick={() => onApprove(testimonial.id)} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                    {t('testimonials.approve')}
                </button>
            </div>
        </div>
    );
};

export default ModerationCard;