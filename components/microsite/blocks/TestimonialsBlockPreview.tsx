import React from 'react';
import { TestimonialsBlock } from '../../../types';

const TestimonialsBlockPreview: React.FC<TestimonialsBlock> = ({ title, testimonials }) => {
    return (
        <section className="py-8 bg-gray-50 dark:bg-gray-700/50 my-2 rounded-lg">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'What Our Clients Say'}</h2>
            <div className="space-y-6 px-4">
                {testimonials.map(testimonial => (
                    <blockquote key={testimonial.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm max-w-2xl mx-auto">
                        <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.quote || 'An amazing testimonial about our service.'}"</p>
                        <footer className="mt-2 text-sm text-right font-semibold text-gray-600 dark:text-gray-400">- {testimonial.author || 'Happy Client'}</footer>
                    </blockquote>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsBlockPreview;
