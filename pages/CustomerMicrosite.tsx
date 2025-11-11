import React, { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { Customer, Policy, TimelineEvent } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import AddTimelineEventModal from '../components/customer/AddTimelineEventModal';
import AttentionFlagModal from '../components/customer/AttentionFlagModal';
import EditProfileModal from '../components/customer/EditProfileModal';
import DetailedPolicyView from '../components/customer/DetailedPolicyView';
import CustomerTimeline from '../components/customer/CustomerTimeline';
import EmbeddedGapAnalysis from '../components/customer/EmbeddedGapAnalysis';
import { useAnalysisData } from '../hooks/useAnalysisData';
import StoredAnalysisCard from '../components/customer/StoredAnalysisCard';

const CustomerProfile: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { customers, isLoading, error, updateCustomer, addTimelineEvent, addAnnotationToEvent, updateCustomerAttentionFlag, toggleTimelineEventFlag } = useCrmData();
    const { analyses, isLoading: isLoadingAnalyses } = useAnalysisData(customerId);

    const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
    const [isAttentionModalOpen, setAttentionModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);

    const customer = useMemo(() => {
        if (!customerId) return null;
        return customers.find(c => c.id === customerId);
    }, [customers, customerId]);

    if (isLoading) {
        return <SkeletonLoader className="h-screen w-full" />;
    }
    
    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    if (!customer) {
        return <Navigate to="/micro-crm" replace />;
    }

    const handleAddEvent = (eventData: Omit<TimelineEvent, 'id' | 'date' | 'author'>) => {
        const author = currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System';
        addTimelineEvent(customer.id, { ...eventData, author });
        setAddEventModalOpen(false);
    };

    const handleAddAnnotation = (eventId: string, content: string) => {
        const author = currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System';
        addAnnotationToEvent(customer.id, eventId, { author, content });
    };

    const handleSetAttentionFlag = (reason: string) => {
        updateCustomerAttentionFlag(customer.id, reason);
        setAttentionModalOpen(false);
    };

    const handleUpdatePolicy = (updatedPolicy: Policy) => {
        const updatedPolicies = customer.policies.map(p => p.id === updatedPolicy.id ? updatedPolicy : p);
        updateCustomer({ ...customer, policies: updatedPolicies });
    };

    const handleUpdateProfile = (updatedCustomer: Customer) => {
        updateCustomer(updatedCustomer);
        setEditProfileModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {customer.attentionFlag && (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-md shadow-sm border border-yellow-200 dark:border-yellow-700">
                    <strong className="font-semibold">Attention:</strong> {customer.attentionFlag}
                </div>
            )}
            
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{customer.firstName} {customer.lastName}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{customer.email}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <button onClick={() => setAttentionModalOpen(true)} className="px-4 py-2 text-sm bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500">
                           {customer.attentionFlag ? 'Edit Flag' : 'Set Attention Flag'}
                        </button>
                        <button onClick={() => setEditProfileModalOpen(true)} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Policies Section */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">{t('customer.policies')}</h2>
                <div className="space-y-4">
                    {customer.policies.map(policy => (
                        <DetailedPolicyView key={policy.id} policy={policy} onUpdatePolicy={handleUpdatePolicy} />
                    ))}
                </div>
            </div>
            
            {/* AI Gap Analysis Section */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">{t('customer.aiAnalysis')}</h2>
                <EmbeddedGapAnalysis customer={customer} />
                {isLoadingAnalyses ? <SkeletonLoader className="h-24 w-full mt-4" /> : (
                    analyses.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {analyses.map(analysis => <StoredAnalysisCard key={analysis.id} analysis={analysis} />)}
                        </div>
                    )
                )}
            </div>

            {/* Timeline Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">{t('customer.timeline')}</h2>
                    <button onClick={() => setAddEventModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('customer.addEvent')}
                    </button>
                </div>
                <CustomerTimeline timeline={customer.timeline} onAddAnnotation={handleAddAnnotation} onFlagEvent={(eventId) => toggleTimelineEventFlag(customer.id, eventId)} />
            </div>
            
            {/* Modals */}
            <AddTimelineEventModal isOpen={isAddEventModalOpen} onClose={() => setAddEventModalOpen(false)} onSubmit={handleAddEvent} />
            <AttentionFlagModal isOpen={isAttentionModalOpen} onClose={() => setAttentionModalOpen(false)} onSubmit={handleSetAttentionFlag} currentReason={customer.attentionFlag} />
            <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} onSubmit={handleUpdateProfile} customer={customer} />
        </div>
    );
};

export default CustomerProfile;
