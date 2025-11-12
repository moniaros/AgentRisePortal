import React, { useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { useAnalysisData } from '../hooks/useAnalysisData';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { Customer, Policy, TimelineEvent } from '../types';

// Import child components
import CustomerTimeline from '../components/customer/CustomerTimeline';
import AddTimelineEventModal from '../components/customer/AddTimelineEventModal';
import AttentionFlagModal from '../components/customer/AttentionFlagModal';
import EditProfileModal from '../components/customer/EditProfileModal';
import AddressChangeModal from '../components/customer/AddressChangeModal';
import EmbeddedGapAnalysis from '../components/customer/EmbeddedGapAnalysis';
import StoredAnalysisCard from '../components/customer/StoredAnalysisCard';
import DetailedPolicyView from '../components/customer/DetailedPolicyView';

const CustomerProfile: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { addNotification } = useNotification();

    const { customers, isLoading, error, updateCustomer, addTimelineEvent, addAnnotationToEvent, updateCustomerAttentionFlag, toggleTimelineEventFlag } = useCrmData();
    const { analyses: storedAnalyses, isLoading: isLoadingAnalyses } = useAnalysisData(customerId);

    const [isTimelineModalOpen, setTimelineModalOpen] = useState(false);
    const [isAttentionModalOpen, setAttentionModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    
    const customer = useMemo(() => {
        if (!customerId || isLoading) return null;
        return customers.find(c => c.id === customerId);
    }, [customerId, customers, isLoading]);

    if (isLoading) {
        return <SkeletonLoader className="h-screen w-full" />;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }
    
    if (!customer) {
        return <Navigate to="/micro-crm" replace />;
    }
    
    const handleAddTimelineEvent = (eventData: Omit<TimelineEvent, 'id' | 'date' | 'author' | 'annotations'>) => {
        const author = currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System';
        addTimelineEvent(customer.id, { ...eventData, author });
        setTimelineModalOpen(false);
        addNotification(t('customer.eventAdded'), 'success');
    };

    const handleAddAnnotation = (eventId: string, content: string) => {
        const author = currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System';
        addAnnotationToEvent(customer.id, eventId, { author, content });
    };
    
    const handleUpdateAttentionFlag = (reason: string) => {
        updateCustomerAttentionFlag(customer.id, reason);
        setAttentionModalOpen(false);
    };

    const handleUpdateProfile = (customerData: Customer) => {
        updateCustomer(customerData);
        setEditProfileModalOpen(false);
    };

    const handleUpdateAddress = (newAddress: string) => {
        updateCustomer({ ...customer, address: newAddress });
        addTimelineEvent(customer.id, {
            type: 'system',
            content: `Address updated to: ${newAddress}`,
            author: 'System',
        });
        setAddressModalOpen(false);
    };

    const handleUpdatePolicy = (updatedPolicy: Policy) => {
        const updatedPolicies = customer.policies.map(p => p.id === updatedPolicy.id ? updatedPolicy : p);
        updateCustomer({ ...customer, policies: updatedPolicies });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative">
                {customer.attentionFlag && (
                    <div className="absolute top-0 right-0 p-4">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div>
                        <h1 className="text-3xl font-bold">{customer.firstName} {customer.lastName}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{customer.email}</p>
                    </div>
                </div>
                {customer.attentionFlag && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700 rounded-md text-sm">
                       <strong>{t('customer.attentionFlag')}:</strong> {customer.attentionFlag}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">{t('crm.form.policies')}</h2>
                        </div>
                        <div className="space-y-4">
                            {customer.policies.map(policy => (
                                <DetailedPolicyView key={policy.id} policy={policy} onUpdatePolicy={handleUpdatePolicy} />
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">{t('customer.timeline')}</h2>
                            <button onClick={() => setTimelineModalOpen(true)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                {t('customer.addEvent')}
                            </button>
                        </div>
                        <CustomerTimeline timeline={customer.timeline} onAddAnnotation={handleAddAnnotation} onFlagEvent={(eventId) => toggleTimelineEventFlag(customer.id, eventId)} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-3">{t('common.actions')}</h3>
                        <div className="space-y-2">
                           <button onClick={() => setEditProfileModalOpen(true)} className="w-full text-left p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">✏️ {t('customer.editProfile')}</button>
                           <button onClick={() => setAddressModalOpen(true)} className="w-full text-left p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">📍 {t('customer.changeAddress')}</button>
                           <button onClick={() => setAttentionModalOpen(true)} className="w-full text-left p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">⚠️ {customer.attentionFlag ? t('customer.editAttentionFlag') : t('customer.setAttentionFlag')}</button>
                           {customer.attentionFlag && <button onClick={() => updateCustomerAttentionFlag(customer.id, null)} className="w-full text-left p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">🗑️ {t('customer.clearAttentionFlag')}</button>}
                        </div>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-3">AI Gap Analysis</h3>
                        <EmbeddedGapAnalysis customer={customer} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-3">Analysis History</h3>
                        {isLoadingAnalyses ? <SkeletonLoader className="h-24 w-full"/> : (
                            <div className="space-y-3">
                                {storedAnalyses.length > 0 ? storedAnalyses.map(analysis => (
                                    <StoredAnalysisCard key={analysis.id} analysis={analysis} />
                                )) : <p className="text-xs text-gray-500">No past analyses found for this customer.</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <AddTimelineEventModal isOpen={isTimelineModalOpen} onClose={() => setTimelineModalOpen(false)} onSubmit={handleAddTimelineEvent} />
            <AttentionFlagModal isOpen={isAttentionModalOpen} onClose={() => setAttentionModalOpen(false)} onSubmit={handleUpdateAttentionFlag} currentReason={customer.attentionFlag} />
            {isEditProfileModalOpen && <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} onSubmit={handleUpdateProfile} customer={customer} />}
            {isAddressModalOpen && <AddressChangeModal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} onSubmit={handleUpdateAddress} currentAddress={customer.address || ''} />}
        </div>
    );
};

export default CustomerProfile;
