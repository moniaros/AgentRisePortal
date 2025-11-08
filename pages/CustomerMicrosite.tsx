import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useLocalization } from '../hooks/useLocalization';
import { Customer, Policy } from '../types';
import { useCrmData } from '../hooks/useCrmData';
import PolicyCard from '../components/customer/PolicyCard';
import CustomerTimeline from '../components/customer/CustomerTimeline';
import AddressChangeModal from '../components/customer/AddressChangeModal';
import RenewalModal from '../components/customer/RenewalModal';

const CustomerMicrosite: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLocalization();
  const { customers, updateCustomer, logCustomerEvent, isLoading, error } = useCrmData();
  const customer = customers.find(c => c.id === id);

  const [activeTab, setActiveTab] = useState<'info' | 'policies' | 'timeline'>('policies');
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [isRenewalModalOpen, setRenewalModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAddressUpdate = (newAddress: string) => {
    if (customer) {
        const updatedCustomer = { ...customer, address: newAddress };
        updateCustomer(updatedCustomer);
        logCustomerEvent(customer.id, {
            type: 'address_change',
            title: t('customer.timelineEvents.address_change.title'),
            content: t('customer.timelineEvents.address_change.content').replace('{newAddress}', newAddress),
            author: 'System',
        });
    }
    setAddressModalOpen(false);
  };
  
  const openRenewalModal = (policy: Policy) => {
    setSelectedPolicy(policy);
    setRenewalModalOpen(true);
  };
  
  const handleRenewalSubmit = (renewalDetails: { newEndDate: string; newPremium: number }) => {
    if (customer && selectedPolicy) {
        const updatedPolicies = customer.policies.map(p => 
            p.id === selectedPolicy.id 
            ? { ...p, endDate: renewalDetails.newEndDate, premium: renewalDetails.newPremium, isActive: true }
            : p
        );
        const updatedCustomer = { ...customer, policies: updatedPolicies };
        updateCustomer(updatedCustomer);
        logCustomerEvent(customer.id, {
            type: 'policy_renewal',
            title: t('customer.timelineEvents.policy_renewal.title'),
            content: t('customer.timelineEvents.policy_renewal.content')
                .replace('{policyNumber}', selectedPolicy.policyNumber)
                .replace('{endDate}', new Date(renewalDetails.newEndDate).toLocaleDateString())
                .replace('{premium}', renewalDetails.newPremium.toFixed(2)),
            author: 'System',
        });
    }
    setRenewalModalOpen(false);
    setSelectedPolicy(null);
  };

  const handleCheckPremiums = () => {
      if (!customer) return;
      customer.policies.forEach(policy => {
          if(policy.isActive && new Date(policy.endDate) > new Date()) {
              logCustomerEvent(customer.id, {
                  type: 'premium_reminder',
                  title: t('customer.timelineEvents.premium_reminder.title'),
                  content: t('customer.timelineEvents.premium_reminder.content').replace('{policyNumber}', policy.policyNumber),
                  author: 'System (Automated)',
              });
          }
      });
      alert('Premium reminder check complete. See timeline for logs.');
  };
  
  const handleAiReview = async (policy: Policy) => {
      if(!customer) return;
      setIsAiLoading(true);
      try {
          const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
          const prompt = `${t('customer.aiReviewPrompt')}
          
          Customer Details: ${JSON.stringify({name: `${customer.firstName} ${customer.lastName}`, dob: customer.dateOfBirth}, null, 2)}
          Policy Details: ${JSON.stringify(policy, null, 2)}
          `;

          const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
          });
          
          alert(`${t('customer.aiReviewTitle')}:\n\n${response.text}`);

          logCustomerEvent(customer.id, {
              type: 'ai_review',
              title: t('customer.timelineEvents.ai_review.title'),
              content: t('customer.timelineEvents.ai_review.content').replace('{policyNumber}', policy.policyNumber),
              author: 'AI Assistant',
          });

      } catch (err) {
          alert(`Error: ${err instanceof Error ? err.message : 'Unknown AI error'}`);
      } finally {
          setIsAiLoading(false);
      }
  };


  if (isLoading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (error) return <div className="text-red-500 text-center p-8">{error.message}</div>;
  if (!customer) return <div className="text-center p-8">{t('customer.notFound')}</div>;

  return (
    <div>
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => setActiveTab('policies')} className={`${activeTab === 'policies' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('customer.policyManagementTab')}</button>
            <button onClick={() => setActiveTab('timeline')} className={`${activeTab === 'timeline' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('customer.timelineTitle')}</button>
            <button onClick={() => setActiveTab('info')} className={`${activeTab === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('customer.contactInfoTab')}</button>
          </nav>
        </div>

      {activeTab === 'info' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{customer.firstName} {customer.lastName}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{customer.email}</p>
                    <p className="text-gray-600 dark:text-gray-400">{customer.phone}</p>
                </div>
                <div className="mt-4 sm:mt-0 text-left sm:text-right">
                    <p className="text-gray-600 dark:text-gray-400">{customer.address}</p>
                    <button onClick={() => setAddressModalOpen(true)} className="text-sm text-blue-500 hover:underline">
                        {t('customer.changeAddress')}
                    </button>
                </div>
            </div>
          </div>
      )}

      {activeTab === 'policies' && (
          <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">{t('customer.policiesTitle')}</h2>
                <button onClick={handleCheckPremiums} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">{t('customer.checkPremiums')}</button>
            </div>
            <div className="space-y-6">
                {customer.policies.map(policy => (
                    <PolicyCard 
                        key={policy.id} 
                        policy={policy} 
                        onRenew={openRenewalModal}
                        onAiReview={handleAiReview}
                        isAiLoading={isAiLoading}
                    />
                ))}
            </div>
          </div>
      )}
      
      {activeTab === 'timeline' && (
          <div>
              <h2 className="text-2xl font-semibold mb-4">{t('customer.timelineTitle')}</h2>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <CustomerTimeline events={customer.timeline} />
              </div>
          </div>
      )}

      <AddressChangeModal 
        isOpen={isAddressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        currentAddress={customer.address}
        onSubmit={handleAddressUpdate}
      />

      {selectedPolicy && (
        <RenewalModal
            isOpen={isRenewalModalOpen}
            onClose={() => setRenewalModalOpen(false)}
            policy={selectedPolicy}
            onSubmit={handleRenewalSubmit}
        />
      )}
    </div>
  );
};

export default CustomerMicrosite;