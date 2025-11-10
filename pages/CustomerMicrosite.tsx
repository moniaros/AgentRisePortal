import React, { useState, useMemo } from 'react';
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
import AttentionFlagModal from '../components/customer/AttentionFlagModal';
import AddTimelineEventModal from '../components/customer/AddTimelineEventModal';
import EditProfileModal from '../components/customer/EditProfileModal';
import PolicyRecommendationModal from '../components/customer/PolicyRecommendationModal';
// Fix: Use GoogleGenAI from @google/genai
import { GoogleGenAI } from '@google/genai';

const CustomerMicrosite: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useLocalization();
    const { 
        customers,
        isLoading,
        error,
        updateCustomer,
        addTimelineEvent,
        addAnnotationToEvent,
        updateCustomerAttentionFlag,
        toggleTimelineEventFlag,
    } = useCrmData();
    
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [isRenewalModalOpen, setRenewalModalOpen] = useState(false);
    const [isAttentionModalOpen, setAttentionModalOpen] = useState(false);
    const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isAiReviewModalOpen, setAiReviewModalOpen] = useState(false);
    
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const customer = useMemo(() => customers.find(c => c.id === id), [customers, id]);

    const handleAddressChange = (newAddress: string) => {
        if (!customer) return;
        updateCustomer({ ...customer, address: newAddress });
        addTimelineEvent(customer.id, {
            type: 'system',
            content: `Address updated to: ${newAddress}`,
            author: 'System',
        });
        setAddressModalOpen(false);
    };

    const handleOpenRenewalModal = (policy: Policy) => {
        setSelectedPolicy(policy);
        setRenewalModalOpen(true);
    };
    
    const handleRenewalSubmit = (newEndDate: string) => {
        if (!customer || !selectedPolicy) return;
        const updatedPolicies = customer.policies.map(p => 
            p.id === selectedPolicy.id ? { ...p, endDate: newEndDate, isActive: true } : p
        );
        updateCustomer({ ...customer, policies: updatedPolicies });
        addTimelineEvent(customer.id, {
            type: 'policy_update',
            content: `Policy ${selectedPolicy.policyNumber} renewed until ${newEndDate}.`,
            author: 'Agent Smith',
        });
        setRenewalModalOpen(false);
        setSelectedPolicy(null);
    };

    const handleAttentionFlagSubmit = (reason: string) => {
        if (!customer) return;
        updateCustomerAttentionFlag(customer.id, reason);
        setAttentionModalOpen(false);
    };

    const handleClearAttentionFlag = () => {
        if (!customer) return;
        updateCustomerAttentionFlag(customer.id, null);
    };

    const handleAddEvent = (eventData: Omit<TimelineEvent, 'id' | 'date' | 'author' | 'annotations'>) => {
        if (!customer) return;
        addTimelineEvent(customer.id, { ...eventData, author: 'Agent Smith' });
        setAddEventModalOpen(false);
    };

    const handleProfileUpdate = (updatedData: Customer) => {
        updateCustomer(updatedData);
        setEditProfileModalOpen(false);
    };

    const handleAiReview = async (policy: Policy) => {
        if (!customer || !process.env.API_KEY) return;
        
        setSelectedPolicy(policy);
        setIsAiLoading(true);
        setAiRecommendation(null);
        setAiReviewModalOpen(true);

        try {
            // Fix: Initialize GoogleGenAI with apiKey object
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Review the following insurance policy for ${customer.firstName} ${customer.lastName} and provide a brief, easy-to-understand summary. 
                Highlight any potential gaps and suggest one relevant upsell or cross-sell opportunity.
                Format the output as simple markdown.

                Policy Details: ${JSON.stringify(policy, null, 2)}
                Customer Context: Date of birth ${customer.dateOfBirth}. Address: ${customer.address}.
            `;

            // Fix: Use correct generateContent call
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            // Fix: Extract text directly from response
            setAiRecommendation(response.text);

        } catch (err) {
            console.error("AI review failed:", err);
            setAiRecommendation("Sorry, the AI review could not be completed at this time.");
        } finally {
            setIsAiLoading(false);
        }
    };


    if (isLoading) return <SkeletonLoader className="h-screen w-full" />;
    if (error) return <ErrorMessage message={error.message} />;
    if (!customer) return <div className="p-8 text-center">{t('customer.notFound')} <Link to="/micro-crm" className="text-blue-500">Go Back</Link></div>;

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{customer.firstName} {customer.lastName}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{customer.email} &bull; {customer.phone}</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{customer.address} <button onClick={() => setAddressModalOpen(true)} className="text-blue-500 text-xs ml-2">({t('common.edit')})</button></p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                        <button onClick={() => setEditProfileModalOpen(true)} className="w-full text-sm px-4 py-2 border rounded-md dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">{t('customer.editProfile')}</button>
                        <button onClick={() => setAttentionModalOpen(true)} className="w-full text-sm px-4 py-2 bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500 transition font-semibold">{t('customer.setAttentionFlag')}</button>
                    </div>
                </div>
                {customer.attentionFlag && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold">{t('customer.attentionNeeded')}</p>
                                <p className="text-sm">{customer.attentionFlag}</p>
                            </div>
                            <button onClick={handleClearAttentionFlag} className="text-xs font-semibold hover:underline">{t('customer.clearFlag')}</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Policies section */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">{t('crm.form.policies')}</h2>
                <div className="space-y-4">
                    {customer.policies.map(policy => (
                        <PolicyCard 
                            key={policy.id} 
                            policy={policy} 
                            onRenew={handleOpenRenewalModal} 
                            onAiReview={handleAiReview}
                            isAiLoading={isAiLoading && selectedPolicy?.id === policy.id}
                        />
                    ))}
                </div>
            </div>

            {/* Timeline section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-semibold">{t('customer.timeline')}</h2>
                     <button onClick={() => setAddEventModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">+ {t('customer.addEvent')}</button>
                </div>
                <CustomerTimeline 
                    timeline={customer.timeline}
                    onAddAnnotation={(eventId, content) => addAnnotationToEvent(customer.id, eventId, { content, author: 'Agent Smith' })}
                    onFlagEvent={(eventId) => toggleTimelineEventFlag(customer.id, eventId)}
                />
            </div>
            
            {/* Modals */}
            <AddressChangeModal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} currentAddress={customer.address} onSubmit={handleAddressChange} />
            {selectedPolicy && <RenewalModal isOpen={isRenewalModalOpen} onClose={() => { setRenewalModalOpen(false); setSelectedPolicy(null); }} policy={selectedPolicy} onSubmit={handleRenewalSubmit} />}
            <AttentionFlagModal isOpen={isAttentionModalOpen} onClose={() => setAttentionModalOpen(false)} onSubmit={handleAttentionFlagSubmit} currentReason={customer.attentionFlag} />
            <AddTimelineEventModal isOpen={isAddEventModalOpen} onClose={() => setAddEventModalOpen(false)} onSubmit={handleAddEvent} />
            <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} customer={customer} onSubmit={handleProfileUpdate} />
            {selectedPolicy && <PolicyRecommendationModal isOpen={isAiReviewModalOpen} onClose={() => { setAiReviewModalOpen(false); setSelectedPolicy(null); setAiRecommendation(null); }} policy={selectedPolicy} recommendation={aiRecommendation} isLoading={isAiLoading} />}
        </div>
    );
};

export default CustomerMicrosite;
