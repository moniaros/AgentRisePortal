import React from 'react';
import { Testimonial } from '../../types';
import StarRating from '../ui/StarRating';

interface TestimonialCardProps {
    testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 flex flex-col h-full">
            <div className="flex-grow">
                <StarRating rating={testimonial.rating} />
                <p className="text-gray-600 dark:text-gray-300 italic my-4">"{testimonial.quote}"</p>
            </div>
            <div className="flex items-center mt-4">
                <img 
                    src={testimonial.authorPhotoUrl || `https://i.pravatar.cc/150?u=${testimonial.authorName}`} 
                    alt={testimonial.authorName} 
                    className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{testimonial.authorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(testimonial.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;