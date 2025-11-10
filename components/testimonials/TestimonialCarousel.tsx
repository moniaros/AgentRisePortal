import React, { useState, useEffect, useMemo } from 'react';
import { useTestimonialsData } from '../../hooks/useTestimonialsData';
import StarRating from '../ui/StarRating';
import SkeletonLoader from '../ui/SkeletonLoader';

const TestimonialCarousel: React.FC = () => {
    const { testimonials, isLoading } = useTestimonialsData();
    const [currentIndex, setCurrentIndex] = useState(0);

    const approvedTestimonials = useMemo(() => 
        testimonials.filter(t => t.status === 'approved'),
        [testimonials]
    );

    useEffect(() => {
        if (approvedTestimonials.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % approvedTestimonials.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, [approvedTestimonials.length]);

    const handlePrev = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + approvedTestimonials.length) % approvedTestimonials.length);
    };

    const handleNext = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % approvedTestimonials.length);
    };

    if (isLoading) {
        return <SkeletonLoader className="h-full w-full" />;
    }

    if (approvedTestimonials.length === 0) {
        return <div className="text-center text-sm text-gray-500 flex items-center justify-center h-full">No testimonials yet.</div>;
    }
    
    const currentTestimonial = approvedTestimonials[currentIndex];

    return (
        <div className="relative h-full flex flex-col justify-center items-center text-center p-4">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 mx-auto">
                <img 
                    src={currentTestimonial.authorPhotoUrl || `https://i.pravatar.cc/150?u=${currentTestimonial.authorName}`} 
                    alt={currentTestimonial.authorName} 
                    className="w-full h-full object-cover"
                />
            </div>
            <StarRating rating={currentTestimonial.rating} className="h-4 w-4 justify-center" />
            <p className="text-sm italic text-gray-600 dark:text-gray-300 my-2">"{currentTestimonial.quote}"</p>
            <p className="font-semibold text-xs text-gray-800 dark:text-gray-200">{currentTestimonial.authorName}</p>
            
            {approvedTestimonials.length > 1 && (
                 <>
                    <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-700">
                        &#x25C0;
                    </button>
                    <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-700">
                        &#x25B6;
                    </button>
                </>
            )}
        </div>
    );
};

export default TestimonialCarousel;