import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import StarRating from '../ui/StarRating';

interface AddTestimonialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (quote: string, rating: number) => void;
}

const AddTestimonialModal: React.FC<AddTestimonialModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const { t } = useLocalization();
    const [quote, setQuote] = useState('');
    const [rating, setRating] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quote && rating > 0) {
            onSubmit(quote, rating);
            setQuote('');
            setRating(0);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-xl font-bold">{t('testimonials.form.title')}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="quote" className="block text-sm font-medium">{t('testimonials.form.yourQuote')}</label>
                            <textarea
                                id="quote"
                                value={quote}
                                onChange={(e) => setQuote(e.target.value)}
                                className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 min-h-[100px]"
                                required
                                placeholder={t('testimonials.form.yourQuotePlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('testimonials.form.rating')}</label>
                            <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => setRating(index + 1)}
                                        className="focus:outline-none"
                                    >
                                        <svg className={`h-8 w-8 transition-colors ${index < rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.446a1 1 0 00-.364 1.118l1.287 3.956c.3.921-.755 1.688-1.539 1.118l-3.368-2.446a1 1 0 00-1.175 0l-3.368 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.956a1 1 0 00-.364-1.118L2.064 9.383c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('crm.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={!quote || rating === 0}>{t('testimonials.form.submit')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTestimonialModal;