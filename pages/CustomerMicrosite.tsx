
import React, { useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import { Policy, TimelineEvent } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import CustomerTimeline from '../components/customer/CustomerTimeline';
import AddressChangeModal from '../components/customer/AddressChangeModal';
import AttentionFlagModal from '../components/customer/AttentionFlagModal';
import AddTimelineEventModal from '../components/customer/AddTimelineEventModal';
import EditProfileModal from '../components/customer/EditProfileModal';
import { useAuth } from '../hooks/useAuth';
import EmbeddedGapAnalysis from '../components/customer/EmbeddedGapAnalysis';
import DetailedPolicyView from '../components/customer/DetailedPolicyView';

const CustomerProfile: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { customers, isLoading, error, updateCustomer, addTimelineEvent, addAnnotationToEvent, updateCustomerAttentionFlag, toggleTimelineEventFlag } = useCrmData();
    
    const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);

    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [isAttentionModalOpen, setAttentionModalOpen] = useState(false);
    const [isTimelineModalOpen, setTimelineModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);

    if (isLoading) return <SkeletonLoader className="h-screen w-full" />;
    if (error) return <ErrorMessage message={error.message as string} />;
    if (!customer) return <Navigate to="/micro-crm" replace />;

    const handleAddressSubmit = (newAddress: string) => {
        updateCustomer({ ...customer, address: newAddress });
        addTimelineEvent(customer.id, {
            type: 'system',
            content: `Address updated to: ${newAddress}`,
            author: currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System',
        });
        setAddressModalOpen(false);
    };

    const handlePolicyUpdate = (updatedPolicy: Policy) => {
        const updatedPolicies = customer.policies.map(p => p.id === updatedPolicy.id ? updatedPolicy : p);
        updateCustomer({ ...customer, policies: updatedPolicies });
    };

    const handleAddTimelineEvent = (data: Omit<TimelineEvent, 'id' | 'date' | 'author' | 'annotations'>) => {
        addTimelineEvent(customer.id, {
            ...data,
            author: currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System'
        });
        setTimelineModalOpen(false);
    };
    
    const handleSaveProfile = (updatedData: any) => {
        updateCustomer({ ...customer, ...updatedData });
        setEditProfileModalOpen(false);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{customer.firstName} {customer.lastName}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{customer.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{customer.address}
                            <button onClick={() => setAddressModalOpen(true)} className="ml-2 text-blue-500 text-xs hover:underline">({t('common.edit') as string})</button>
                        </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                         <button onClick={() => setEditProfileModalOpen(true)} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">{t('customer.editProfile') as string}</button>
                        {customer.attentionFlag ? (
                             <button onClick={() => updateCustomerAttentionFlag(customer.id, null)} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">Clear Flag</button>
                        ) : (
                             <button onClick={() => setAttentionModalOpen(true)} className="px-4 py-2 text-sm bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-500">Set Attention Flag</button>
                        )}
                    </div>
                </div>
                 {customer.attentionFlag && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700 rounded-md text-sm">
                        <strong>Attention:</strong> {customer.attentionFlag}
                    </div>
                )}
            </div>

            {/* Policies */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">{t('crm.form.policies') as string}</h2>
                <div className="space-y-4">
                    {customer.policies.map(policy => (
                        <DetailedPolicyView
                            key={policy.id}
                            policy={policy}
                            onUpdatePolicy={handlePolicyUpdate}
                        />
                    ))}
                </div>
            </div>

            {/* Embedded AI Gap Analysis */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-2">{t('customer.analyzePolicies')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">{t('customer.analyzeDescription')}</p>
                <EmbeddedGapAnalysis customer={customer} />
            </div>

            {/* Timeline */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">{t('customer.timeline') as string}</h2>
                    <button onClick={() => setTimelineModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                        {t('customer.addEvent') as string}
                    </button>
                </div>
                <CustomerTimeline
                    timeline={customer.timeline}
                    onAddAnnotation={(eventId, content) => addAnnotationToEvent(customer.id, eventId, { content, author: currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System' })}
                    onFlagEvent={(eventId) => toggleTimelineEventFlag(customer.id, eventId)}
                />
            </div>
            
            {/* Modals */}
            <AddressChangeModal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} currentAddress={customer.address || ''} onSubmit={handleAddressSubmit} />
            <AttentionFlagModal isOpen={isAttentionModalOpen} onClose={() => setAttentionModalOpen(false)} currentReason={customer.attentionFlag} onSubmit={(reason) => { updateCustomerAttentionFlag(customer.id, reason); setAttentionModalOpen(false); }} />
            <AddTimelineEventModal isOpen={isTimelineModalOpen} onClose={() => setTimelineModalOpen(false)} onSubmit={handleAddTimelineEvent} />
            <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} customer={customer} onSubmit={handleSaveProfile} />

        </div>
    );
};

export default CustomerProfile;
