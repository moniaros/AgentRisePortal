import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import { Customer, Policy, TimelineEvent } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import PolicyCard from '../components/customer/PolicyCard';
import CustomerTimeline from '../components/customer/CustomerTimeline';
import AddressChangeModal from '../components/customer/AddressChangeModal';
import RenewalModal from '../components/customer/RenewalModal';
import { useAuth } from '../hooks/useAuth';
import AttentionFlagModal from '../components/customer/AttentionFlagModal';
import AddTimelineEventModal from '../components/customer/AddTimelineEventModal';

const CustomerMicrosite: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { 
        customers, 
        isLoading, 
        error, 
        updateCustomer, 
        addTimelineEvent, 
        addAnnotationToEvent, 
        updateCustomerAttentionFlag,
        toggleTimelineEventFlag
    } = useCrmData();
    const { t } = useLocalization();
    const { currentUser } = useAuth();

    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [isRenewalModalOpen, setRenewalModalOpen] = useState(false);
    const [isAttentionModalOpen, setAttentionModalOpen] = useState(false);
    const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const customer = useMemo(() => {
        return customers.find(c => c.id === id);
    }, [customers, id]);

    const handleAddressSubmit = (newAddress: string) => {
        if (customer) {
            updateCustomer({ ...customer, address: newAddress });
            addTimelineEvent(customer.id, {
                type: 'system',
                content: `Address updated to: ${newAddress}`,
                author: currentUser?.name || 'System',
            });
        }
        setAddressModalOpen(false);
    };

    const handleRenewalSubmit = (renewalDetails: { newEndDate: string, newPremium: number }) => {
        if (customer && selectedPolicy) {
            const updatedPolicies = customer.policies.map(p => 
                p.id === selectedPolicy.id 
                ? { ...p, endDate: renewalDetails.newEndDate, premium: renewalDetails.newPremium, isActive: true } 
                : p
            );
            updateCustomer({ ...customer, policies: updatedPolicies });
             addTimelineEvent(customer.id, {
                type: 'policy_update',
                content: `Policy ${selectedPolicy.policyNumber} renewed. New end date: ${renewalDetails.newEndDate}, new premium: €${renewalDetails.newPremium}.`,
                author: currentUser?.name || 'System',
            });
        }
        setRenewalModalOpen(false);
        setSelectedPolicy(null);
    };

    const handleAiReview = async (policy: Policy) => {
        setIsAiLoading(true);
        // Simulate AI review process
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert(`AI review for policy ${policy.policyNumber} is a planned feature.`);
        setIsAiLoading(false);
    };

    const handleAttentionSubmit = (reason: string) => {
        if (customer) {
            updateCustomerAttentionFlag(customer.id, reason);
        }
        setAttentionModalOpen(false);
    };

    const handleAddAnnotation = (eventId: string, content: string) => {
        if (customer && currentUser) {
            addAnnotationToEvent(customer.id, eventId, {
                content,
                author: currentUser.name,
            });
        }
    };

    const handleAddEvent = (eventData: Omit<TimelineEvent, 'id' | 'date' | 'author'>) => {
        if (customer && currentUser) {
            addTimelineEvent(customer.id, { ...eventData, author: currentUser.name });
            setAddEventModalOpen(false);
        }
    };

    const handleFlagEvent = (eventId: string) => {
        if (customer) {
            toggleTimelineEventFlag(customer.id, eventId);
        }
    };

    if (isLoading) {
        return <SkeletonLoader className="h-screen w-full" />;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    if (!customer) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Customer Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400">The requested customer could not be found.</p>
                <Link to="/micro-crm" className="mt-4 inline-block text-blue-500 hover:underline">Return to CRM</Link>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{customer.firstName} {customer.lastName}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{customer.email}</p>
                    </div>
                    <div className="flex flex-col sm:items-end mt-4 sm:mt-0">
                         <p className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</p>
                         <p className="text-sm text-gray-500 dark:text-gray-400">{customer.address}</p>
                         <button onClick={() => setAddressModalOpen(true)} className="text-xs text-blue-500 hover:underline mt-1">{t('common.edit')}</button>
                    </div>
                </div>
                {customer.attentionFlag && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                        <p className="font-bold">{t('customer.attentionNeeded')}</p>
                        <p className="text-sm">{customer.attentionFlag}</p>
                    </div>
                )}
                 <button onClick={() => setAttentionModalOpen(true)} className="mt-2 text-xs text-blue-500 hover:underline">{customer.attentionFlag ? t('customer.editFlag') : t('customer.addFlag')}</button>
            </div>

            {/* Policies */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">{t('crm.form.policies')}</h2>
                <div className="space-y-4">
                    {customer.policies.map(policy => (
                        <PolicyCard 
                            key={policy.id} 
                            policy={policy} 
                            onRenew={(p) => { setSelectedPolicy(p); setRenewalModalOpen(true); }}
                            onAiReview={handleAiReview}
                            isAiLoading={isAiLoading}
                        />
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">{t('customer.timeline')}</h2>
                    <button
                        onClick={() => setAddEventModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        {t('customer.addTimelineEvent')}
                    </button>
                </div>
                 <CustomerTimeline timeline={customer.timeline} onAddAnnotation={handleAddAnnotation} onFlagEvent={handleFlagEvent} />
            </div>

            {/* Modals */}
            <AddressChangeModal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} currentAddress={customer.address} onSubmit={handleAddressSubmit} />
            {selectedPolicy && <RenewalModal isOpen={isRenewalModalOpen} onClose={() => {setRenewalModalOpen(false); setSelectedPolicy(null);}} policy={selectedPolicy} onSubmit={handleRenewalSubmit} />}
            <AttentionFlagModal isOpen={isAttentionModalOpen} onClose={() => setAttentionModalOpen(false)} onSubmit={handleAttentionSubmit} currentReason={customer.attentionFlag} />
            <AddTimelineEventModal isOpen={isAddEventModalOpen} onClose={() => setAddEventModalOpen(false)} onSubmit={handleAddEvent} />
        </div>
    );
};

export default CustomerMicrosite;
