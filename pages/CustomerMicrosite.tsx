import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Customer, Policy } from '../types';
import { fetchCustomerById } from '../services/api'; 
import { useLocalization } from '../hooks/useLocalization';
import { useCrmData } from '../hooks/useCrmData';
import PolicyCard from '../components/customer/PolicyCard';
import CustomerTimeline from '../components/customer/CustomerTimeline';
import AddressChangeModal from '../components/customer/AddressChangeModal';
import RenewalModal from '../components/customer/RenewalModal';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const CustomerMicrosite: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useLocalization();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [isRenewalModalOpen, setRenewalModalOpen] = useState(false);
    const [policyToRenew, setPolicyToRenew] = useState<Policy | null>(null);
    const [aiReview, setAiReview] = useState<{ [policyId: string]: string }>({});
    const [isAiLoading, setIsAiLoading] = useState<string | null>(null);

    // Use a central hook to manage customer data and updates
    const { updateCustomer, logCustomerEvent } = useCrmData();

    useEffect(() => {
        const loadCustomer = async () => {
            if (!id) {
                setError('No customer ID provided.');
                setIsLoading(false);
                return;
            }
            try {
                // Using a direct fetch here, but in a real app this might come from a context
                const data = await fetchCustomerById(id);
                if (data) {
                    setCustomer(data);
                } else {
                    setError('Customer not found.');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load customer data.');
            } finally {
                setIsLoading(false);
            }
        };
        loadCustomer();
    }, [id]);

    const handleAddressUpdate = (newAddress: string) => {
        if (!customer) return;
        const updatedCustomer = { ...customer, address: newAddress };
        setCustomer(updatedCustomer);
        updateCustomer(updatedCustomer); // Persist change via hook
        logCustomerEvent(customer.id, {
            type: 'address_change',
            title: 'Address Updated',
            content: `Address changed to: ${newAddress}`,
            author: 'Agent',
        });
        setAddressModalOpen(false);
    };

    const handleRenewalSubmit = (renewalDetails: { newEndDate: string; newPremium: number }) => {
        if (!customer || !policyToRenew) return;

        const updatedPolicies = customer.policies.map(p =>
            p.id === policyToRenew.id ? { ...p, ...renewalDetails, isActive: true } : p
        );
        const updatedCustomer = { ...customer, policies: updatedPolicies };
        setCustomer(updatedCustomer);
        updateCustomer(updatedCustomer); // Persist
        logCustomerEvent(customer.id, {
            type: 'policy_renewal',
            title: `Policy Renewed: ${policyToRenew.policyNumber}`,
            content: `New end date: ${renewalDetails.newEndDate}, New premium: €${renewalDetails.newPremium.toFixed(2)}`,
            author: 'Agent',
        });
        setRenewalModalOpen(false);
        setPolicyToRenew(null);
    };

    const handleAiReview = async (policy: Policy) => {
        if (!customer) return;
        setIsAiLoading(policy.id);
        setAiReview(prev => ({...prev, [policy.id]: '' }));

        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const prompt = `Review this insurance policy for a customer named ${customer.firstName} ${customer.lastName} and provide a concise summary of potential coverage gaps or opportunities for savings.
            
            Policy Details: ${JSON.stringify(policy, null, 2)}
            
            Customer Info: Date of Birth - ${customer.dateOfBirth}, Address - ${customer.address}.
            
            Focus on practical advice. Format the output as simple markdown.`;
            
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const text = response.text;
            setAiReview(prev => ({...prev, [policy.id]: text }));
             logCustomerEvent(customer.id, {
                type: 'ai_review',
                title: `AI Review for Policy ${policy.policyNumber}`,
                content: `AI analysis was performed.`,
                author: 'System',
            });

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred.';
            setAiReview(prev => ({...prev, [policy.id]: `Error: ${errorMsg}`}));
        } finally {
            setIsAiLoading(null);
        }
    };
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <SkeletonLoader className="h-12 w-1/2" />
                <SkeletonLoader className="h-24 w-full" />
                <SkeletonLoader className="h-48 w-full" />
            </div>
        )
    }

    if (error) return <ErrorMessage message={error} />;
    if (!customer) return <ErrorMessage message="Customer data could not be loaded." />;

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{customer.firstName} {customer.lastName}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{customer.email} | {customer.phone}</p>
                    </div>
                    <button 
                        onClick={() => setAddressModalOpen(true)} 
                        className="mt-4 sm:mt-0 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                        {t('customer.changeAddress')}
                    </button>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{customer.address}</p>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">{t('crm.form.policies')}</h2>
                <div className="space-y-4">
                    {customer.policies.map(policy => (
                        <div key={policy.id}>
                            <PolicyCard 
                                policy={policy}
                                onRenew={(p) => { setPolicyToRenew(p); setRenewalModalOpen(true); }}
                                onAiReview={handleAiReview}
                                isAiLoading={isAiLoading === policy.id}
                            />
                            {aiReview[policy.id] && (
                                <div className="mt-2 bg-purple-50 dark:bg-gray-700 p-4 rounded-b-lg">
                                    <h4 className="font-semibold text-purple-800 dark:text-purple-300">{t('customer.aiReview')}</h4>
                                    <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">{aiReview[policy.id]}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">{t('customer.timeline')}</h2>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <CustomerTimeline events={customer.timeline} />
                 </div>
            </div>
            
            <AddressChangeModal 
                isOpen={isAddressModalOpen}
                onClose={() => setAddressModalOpen(false)}
                currentAddress={customer.address}
                onSubmit={handleAddressUpdate}
            />
            {policyToRenew && (
                <RenewalModal 
                    isOpen={isRenewalModalOpen}
                    onClose={() => setRenewalModalOpen(false)}
                    policy={policyToRenew}
                    onSubmit={handleRenewalSubmit}
                />
            )}
        </div>
    );
};

export default CustomerMicrosite;
