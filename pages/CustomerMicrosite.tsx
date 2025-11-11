import React, { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { Customer, TimelineEvent, Annotation, Policy } from '../types';

import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import CustomerTimeline from '../components/customer/CustomerTimeline';
import AddTimelineEventModal from '../components/customer/AddTimelineEventModal';
import AttentionFlagModal from '../components/customer/AttentionFlagModal';
import EditProfileModal from '../components/customer/EditProfileModal';
import AddressChangeModal from '../components/customer/AddressChangeModal';
import DetailedPolicyView from '../components/customer/DetailedPolicyView';
import EmbeddedGapAnalysis from '../components/customer/EmbeddedGapAnalysis';
import StoredAnalysisCard from '../components/customer/StoredAnalysisCard';
import { useAnalysisData } from '../hooks/useAnalysisData';

const CustomerProfile: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { 
        customers, 
        isLoading, 
        error, 
        addTimelineEvent, 
        addAnnotationToEvent, 
        updateCustomer,
        updateCustomerAttentionFlag,
        toggleTimelineEventFlag
    } = useCrmData();

    const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);
    const { analyses, isLoading: isLoadingAnalyses, refreshAnalyses } = useAnalysisData(customer?.id);

    const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
    const [isAttentionModalOpen, setAttentionModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);

    const handleAddTimelineEvent = (eventData: Omit<TimelineEvent, 'id'|'date'|'author'>) => {
        if (!customer || !currentUser) return;
        addTimelineEvent(customer.id, {
            ...eventData,
            author: `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`,
        });
        setAddEventModalOpen(false);
    };

    const handleAddAnnotation = (eventId: string, content: string) => {
        if (!customer || !currentUser) return;
        const annotationData: Omit<Annotation, 'id'|'date'> = {
            content,
            author: `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`,
        };
        addAnnotationToEvent(customer.id, eventId, annotationData);
    };

    const handleUpdateAttentionFlag = (reason: string) => {
        if (!customer) return;
        updateCustomerAttentionFlag(customer.id, reason);
        setAttentionModalOpen(false);
    };
    
    const handleClearAttentionFlag = () => {
        if (!customer) return;
        updateCustomerAttentionFlag(customer.id, null);
    };

    const handleUpdateProfile = (updatedData: Customer) => {
        updateCustomer(updatedData);
        setEditProfileModalOpen(false);
    };

    const handleUpdateAddress = (newAddress: string) => {
        if (!customer) return;
        updateCustomer({ ...customer, address: newAddress });
        setAddressModalOpen(false);
    };

    const handlePolicyUpdate = (updatedPolicy: Policy) => {
        if (!customer) return;
        const updatedPolicies = customer.policies.map(p => p.id === updatedPolicy.id ? updatedPolicy : p);
        updateCustomer({ ...customer, policies: updatedPolicies });
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <SkeletonLoader className="h-24 w-full" />
                <SkeletonLoader className="h-64 w-full" />
                <SkeletonLoader className="h-48 w-full" />
            </div>
        );
    }

    if (error) return <ErrorMessage message={error.message} />;
    if (!customer) return <Navigate to="/micro-crm" replace />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{customer.firstName} {customer.lastName}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{customer.email} &bull; {customer.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setEditProfileModalOpen(true)} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('customer.editProfile')}</button>
                        <button onClick={() => setAttentionModalOpen(true)} className="px-4 py-2 text-sm bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500">{t('customer.setAttentionFlag')}</button>
                    </div>
                </div>
                {customer.attentionFlag && (
                    <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold">{t('customer.attentionNeeded')}</p>
                                <p className="text-sm">{customer.attentionFlag}</p>
                            </div>
                            <button onClick={handleClearAttentionFlag} className="text-xs font-semibold uppercase hover:underline">{t('customer.clearFlag')}</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Policies Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">{t('crm.form.policies')}</h2>
                        <div className="space-y-4">
                            {customer.policies.map(policy => (
                                <DetailedPolicyView key={policy.id} policy={policy} onUpdatePolicy={handlePolicyUpdate} />
                            ))}
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">{t('customer.timeline')}</h2>
                            <button onClick={() => setAddEventModalOpen(true)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('customer.addEvent')}</button>
                        </div>
                        <CustomerTimeline 
                            timeline={customer.timeline}
                            onAddAnnotation={handleAddAnnotation}
                            onFlagEvent={(eventId) => toggleTimelineEventFlag(customer.id, eventId)}
                        />
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">{t('customer.contactInfo')}</h2>
                        <div className="space-y-3 text-sm">
                           <InfoItem label={t('crm.form.email')} value={customer.email} />
                           <InfoItem label={t('crm.form.phone')} value={customer.phone} />
                           <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-600 dark:text-gray-300">{t('crm.form.address')}</p>
                                    <p>{customer.address || 'N/A'}</p>
                                </div>
                                <button onClick={() => setAddressModalOpen(true)} className="text-xs text-blue-500 hover:underline">Edit</button>
                           </div>
                           <InfoItem label={t('crm.form.dob')} value={customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'N/A'} />
                        </div>
                    </div>

                    {/* AI Gap Analysis */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">{t('gapAnalysis.title')}</h2>
                        <EmbeddedGapAnalysis customer={customer} />
                    </div>

                    {/* Stored Analyses */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">{t('customer.storedAnalyses')}</h2>
                            <button onClick={refreshAnalyses} className="text-xs text-blue-500">Refresh</button>
                        </div>
                        <div className="space-y-4">
                            {isLoadingAnalyses ? <SkeletonLoader className="h-20 w-full" /> : 
                             analyses.length > 0 ? analyses.map(analysis => (
                                <StoredAnalysisCard key={analysis.id} analysis={analysis} />
                             )) : <p className="text-sm text-gray-500">{t('customer.noAnalyses')}</p>
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AddTimelineEventModal isOpen={isAddEventModalOpen} onClose={() => setAddEventModalOpen(false)} onSubmit={handleAddTimelineEvent} />
            <AttentionFlagModal isOpen={isAttentionModalOpen} onClose={() => setAttentionModalOpen(false)} onSubmit={handleUpdateAttentionFlag} currentReason={customer.attentionFlag} />
            <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} onSubmit={handleUpdateProfile} customer={customer} />
            <AddressChangeModal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} onSubmit={handleUpdateAddress} currentAddress={customer.address || ''} />
        </div>
    );
};

const InfoItem: React.FC<{label: string, value?: string}> = ({label, value}) => (
    <div>
        <p className="font-semibold text-gray-600 dark:text-gray-300">{label}</p>
        <p>{value || 'N/A'}</p>
    </div>
);


export default CustomerProfile;
