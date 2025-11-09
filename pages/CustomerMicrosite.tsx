import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import { Customer, Policy } from '../types';
import PolicyCard from '../components/customer/PolicyCard';
import CustomerTimeline from '../components/customer/CustomerTimeline';
import AddressChangeModal from '../components/customer/AddressChangeModal';
import RenewalModal from '../components/customer/RenewalModal';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
// Fix: Correct import for GoogleGenAI
import { GoogleGenAI } from '@google/genai';

const CustomerMicrosite: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLocalization();
  const { customers, updateCustomer, logCustomerEvent, isLoading: isCrmLoading } = useCrmData();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [isRenewalModalOpen, setRenewalModalOpen] = useState(false);
  const [policyToRenew, setPolicyToRenew] = useState<Policy | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReview, setAiReview] = useState<string | null>(null);

  useEffect(() => {
    if (id && customers.length > 0) {
      const foundCustomer = customers.find(c => c.id === id);
      setCustomer(foundCustomer || null);
    }
  }, [id, customers]);

  const handleAddressChange = (newAddress: string) => {
    if (!customer) return;
    const updatedCustomer = { ...customer, address: newAddress };
    updateCustomer(updatedCustomer);
    logCustomerEvent(customer.id, {
        type: 'address_change',
        title: 'Address Updated',
        content: `Address changed to: ${newAddress}`,
        author: 'Agent'
    });
    setAddressModalOpen(false);
  };
  
  const handleOpenRenewalModal = (policy: Policy) => {
      setPolicyToRenew(policy);
      setRenewalModalOpen(true);
  };
  
  const handleRenewalSubmit = (details: { newEndDate: string; newPremium: number }) => {
    if (!customer || !policyToRenew) return;
    const updatedPolicies = customer.policies.map(p =>
        p.id === policyToRenew.id ? { ...p, endDate: details.newEndDate, premium: details.newPremium, isActive: true } : p
    );
    updateCustomer({ ...customer, policies: updatedPolicies });
    logCustomerEvent(customer.id, {
        type: 'policy_renewal',
        title: `Policy ${policyToRenew.policyNumber} Renewed`,
        content: `Policy renewed until ${details.newEndDate} with a premium of €${details.newPremium.toFixed(2)}.`,
        author: 'Agent'
    });
    setRenewalModalOpen(false);
    setPolicyToRenew(null);
  };

  const handleAiReview = async (policy: Policy) => {
    if (!process.env.API_KEY) {
      alert("API Key is not configured.");
      return;
    }
    setIsAiLoading(true);
    setAiReview(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Review this insurance policy and provide a simple, friendly summary for the customer. Highlight key coverages, renewal date, and any potential gaps or savings opportunities. Policy details: ${JSON.stringify(policy)}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text;
      setAiReview(text);
      logCustomerEvent(customer!.id, {
        type: 'ai_review',
        title: `AI Review for ${policy.policyNumber}`,
        content: `An AI-powered review was generated for the policy.`,
        author: 'System'
      });
    } catch (err) {
      console.error(err);
      setAiReview("Failed to generate AI review. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isCrmLoading) {
    return <SkeletonLoader className="h-64 w-full" />;
  }

  if (!customer) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">{t('customer.notFound')}</h2>
        <Link to="/micro-crm" className="text-blue-500 hover:underline">{t('customer.backToCrm')}</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{customer.firstName} {customer.lastName}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{customer.email} | {customer.phone}</p>
                <p className="text-gray-500 dark:text-gray-400">{customer.address}</p>
            </div>
            <button onClick={() => setAddressModalOpen(true)} className="text-sm text-blue-500 hover:underline">{t('customer.changeAddress')}</button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('customer.policies')}</h2>
        <div className="space-y-4">
            {customer.policies.length > 0 ? customer.policies.map(policy => (
                <PolicyCard key={policy.id} policy={policy} onRenew={handleOpenRenewalModal} onAiReview={handleAiReview} isAiLoading={isAiLoading} />
            )) : <p>{t('customer.noPolicies')}</p>}
        </div>
      </div>
      
      {aiReview && (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-bold text-lg mb-2">{t('customer.aiReviewTitle')}</h3>
            <pre className="whitespace-pre-wrap font-sans text-sm">{aiReview}</pre>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4">{t('customer.timeline')}</h2>
        <CustomerTimeline events={customer.timeline} />
      </div>

      <AddressChangeModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setAddressModalOpen(false)} 
        currentAddress={customer.address}
        onSubmit={handleAddressChange}
      />
      
      {policyToRenew && <RenewalModal 
        isOpen={isRenewalModalOpen}
        onClose={() => setRenewalModalOpen(false)}
        policy={policyToRenew}
        onSubmit={handleRenewalSubmit}
      />}
    </div>
  );
};

export default CustomerMicrosite;