import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useTestimonialsData } from '../hooks/useTestimonialsData';
import { useAuth } from '../hooks/useAuth';
// FIX: Module '"../types"' has no exported member 'UserRole'. Use 'UserSystemRole' instead.
import { UserSystemRole } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import TestimonialCard from '../components/testimonials/TestimonialCard';
import ModerationCard from '../components/testimonials/ModerationCard';
import AddTestimonialModal from '../components/testimonials/AddTestimonialModal';
import { useNotification } from '../hooks/useNotification';
import { trackEvent } from '../services/analytics';

const Testimonials: React.FC = () => {
    const { t, language } = useLocalization();
    const { testimonials, isLoading, error, addTestimonial, updateTestimonialStatus } = useTestimonialsData();
    const { currentUser } = useAuth();
    const { addNotification } = useNotification();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');

    const approvedTestimonials = useMemo(() => testimonials.filter(t => t.status === 'approved'), [testimonials]);
    const pendingTestimonials = useMemo(() => testimonials.filter(t => t.status === 'pending'), [testimonials]);
    
    const handleSubmitTestimonial = (quote: string, rating: number) => {
        addTestimonial(quote, rating);
        setIsModalOpen(false);
        addNotification(t('testimonials.form.success'), 'success');
        trackEvent(
            'engagement',
            'Testimonials',
            'testimonial_submitted',
            `rating: ${rating}`,
            language
        );
    };

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('testimonials.title')}</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {t('testimonials.add')}
                </button>
            </div>

            {/* FIX: Property 'role' does not exist on type 'User'. Use partyRole.roleType instead. */}
            {currentUser?.partyRole.roleType === UserSystemRole.ADMIN && (
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('approved')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'approved' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            {t('testimonials.approved')} ({approvedTestimonials.length})
                        </button>
                        <button onClick={() => setActiveTab('pending')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            {t('testimonials.pending')} ({pendingTestimonials.length})
                        </button>
                    </nav>
                </div>
            )}

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <SkeletonLoader key={i} className="h-64 w-full" />)}
                </div>
            )}

            {!isLoading && (
                <>
                    {/* Approved Testimonials */}
                    <div className={activeTab === 'approved' ? 'block' : 'hidden'}>
                        {approvedTestimonials.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {approvedTestimonials.map(testimonial => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-10">{t('testimonials.noApproved')}</p>
                        )}
                    </div>

                    {/* Pending Moderation */}
                    {/* FIX: Property 'role' does not exist on type 'User'. Use partyRole.roleType instead. */}
                    {currentUser?.partyRole.roleType === UserSystemRole.ADMIN && (
                        <div className={activeTab === 'pending' ? 'block' : 'hidden'}>
                            {pendingTestimonials.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pendingTestimonials.map(testimonial => (
                                        <ModerationCard 
                                            key={testimonial.id} 
                                            testimonial={testimonial}
                                            onApprove={() => updateTestimonialStatus(testimonial.id, 'approved')}
                                            onReject={() => updateTestimonialStatus(testimonial.id, 'rejected')}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-10">{t('testimonials.noPending')}</p>
                            )}
                        </div>
                    )}
                </>
            )}

            <AddTestimonialModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitTestimonial}
            />
        </div>
    );
};

export default Testimonials;