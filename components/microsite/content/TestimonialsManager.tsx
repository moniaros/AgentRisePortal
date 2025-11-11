import React from 'react';
import { useTestimonialsData } from '../../../hooks/useTestimonialsData';
import { useLocalization } from '../../../hooks/useLocalization';

const TestimonialsManager: React.FC = () => {
    const { t } = useLocalization();
    const { testimonials, isLoading } = useTestimonialsData();

    return (
        <div>
            <h4 className="font-semibold mb-4">{t('micrositeBuilder.content.testimonialsList')}</h4>
            {isLoading && <p>Loading...</p>}
            <ul className="space-y-2">
                {testimonials.map(testimonial => (
                    <li key={testimonial.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                            <p className="text-sm italic">"{testimonial.quote}"</p>
                            <p className="text-xs text-gray-500">- {testimonial.authorName}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            testimonial.status === 'approved' ? 'bg-green-100 text-green-800' :
                            testimonial.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>{testimonial.status}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TestimonialsManager;
