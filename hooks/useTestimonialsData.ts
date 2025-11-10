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
        updateData: setAllTestimonials 
    } = useOfflineSync<Testimonial[]>('testimonials_data', fetchTestimonials, []);
    
    const testimonials = useMemo(() => {
        return allTestimonials
            .filter(t => t.agencyId === agencyId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [allTestimonials, agencyId]);
    
    const addTestimonial = useCallback((quote: string, rating: number) => {
        if (!agencyId || !currentUser) return;

        const newTestimonial: Testimonial = {
            id: `test_${Date.now()}`,
            // FIX: Property 'name' does not exist on type 'User'. Use party.partyName properties instead.
            authorName: `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`,
            // FIX: Property 'email' does not exist on type 'User'. Use party.contactInfo.email instead.
            authorPhotoUrl: `https://i.pravatar.cc/150?u=${currentUser.party.contactInfo.email}`,
            quote,
            rating,
            status: 'pending',
            agencyId,
            createdAt: new Date().toISOString(),
        };

        setAllTestimonials([newTestimonial, ...allTestimonials]);
    }, [allTestimonials, setAllTestimonials, agencyId, currentUser]);

    const updateTestimonialStatus = useCallback((testimonialId: string, status: 'approved' | 'rejected') => {
        const updatedTestimonials = allTestimonials.map(t => 
            t.id === testimonialId ? { ...t, status } : t
        );
        setAllTestimonials(updatedTestimonials);
    }, [allTestimonials, setAllTestimonials]);

    return { 
        testimonials, 
        isLoading, 
        error,
        addTestimonial,
        updateTestimonialStatus,
    };
};
