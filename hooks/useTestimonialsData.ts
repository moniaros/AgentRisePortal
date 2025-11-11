import { useMemo, useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchTestimonials } from '../services/api';
import { Testimonial } from '../types';
import { useAuth } from './useAuth';

export const useTestimonialsData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allTestimonials,
        isLoading,
        error,
        updateData: setAllTestimonials,
    } = useOfflineSync<Testimonial[]>('testimonials_data', fetchTestimonials, []);

    const testimonials = useMemo(() => {
        return allTestimonials.filter(t => t.agencyId === agencyId);
    }, [allTestimonials, agencyId]);

    const addTestimonial = useCallback((quote: string, rating: number) => {
        if (!agencyId || !currentUser) return;
        const newTestimonial: Testimonial = {
            id: `test_${Date.now()}`,
            authorName: `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`,
            authorPhotoUrl: currentUser.party.profilePhotoUrl,
            quote,
            rating,
            status: 'pending',
            agencyId,
            createdAt: new Date().toISOString(),
        };
        setAllTestimonials([...allTestimonials, newTestimonial]);
    }, [allTestimonials, setAllTestimonials, agencyId, currentUser]);

    const updateTestimonialStatus = useCallback((testimonialId: string, status: 'approved' | 'rejected') => {
        setAllTestimonials(
            allTestimonials.map(t =>
                t.id === testimonialId ? { ...t, status } : t
            )
        );
    }, [allTestimonials, setAllTestimonials]);

    return { testimonials, isLoading, error, addTestimonial, updateTestimonialStatus };
};
