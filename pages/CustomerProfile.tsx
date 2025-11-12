import React, { useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { Customer, TimelineEvent, Policy } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import CustomerTimeline from '../components/customer/CustomerTimeline';
import AddTimelineEventModal from '../components/customer/AddTimelineEventModal';
import AttentionFlagModal from '../components/customer/AttentionFlagModal';
import AddressChangeModal from '../components/customer/AddressChangeModal';
import EditProfileModal from '../components/customer/EditProfileModal';
import EmbeddedGapAnalysis from '../components/customer/EmbeddedGapAnalysis';
import StoredAnalysisCard from '../components/customer/StoredAnalysisCard';
import { useAnalysisData } from '../hooks/useAnalysisData';
import DetailedPolicyView from '../components/customer/DetailedPolicyView';
import ConsentManagement from '../components/customer/ConsentManagement';
import AgentReviewPanel from '../components/customer/review/AgentReviewPanel';
import ActionableOpportunities from '../components/customer/opportunities/ActionableOpportunities';
import { useFindingsData } from '../hooks/useFindingsData';

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
        toggleTimelineEventFlag,
    } = useCrmData();

    const [activeTab, setActiveTab] = useState<'timeline' | 'policies' | 'analysis'>('timeline');
    const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
    const [isAttentionModalOpen, setAttentionModalOpen] = useState(false);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    
    const customer = useMemo(() => {
        return customers.find(c => c.id === customerId);
    }, [customers, customerId]);

    const { analyses, isLoading: isLoadingAnalyses } = useAnalysisData(customerId);
    const { 
        pendingFindings, 
        verifiedOpportunities, 
        updateFindingStatus, 
        updateFindingContent,
        isLoading: isLoadingFindings
    } = useFindingsData(customerId);
    
    if (isLoading) {
        return <SkeletonLoader className="h-screen w-full" />;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    if (!customer) {
        return <Navigate to="/micro-crm" replace />;
    }

    const handleAddTimelineEvent = (data: Omit<TimelineEvent, 'id' | 'date' | 'author' | 'annotations' >) => {
        addTimelineEvent(customer.id, {
            ...data,
            author: currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System',
        });
        setAddEventModalOpen(false);
    };

    const handleAddAnnotation = (eventId: string, content: string) => {
        addAnnotationToEvent(customer.id, eventId, {
            author: currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System',
            content,
        });
    };

    const handleAttentionFlagSubmit = (reason: string) => {
        updateCustomerAttentionFlag(customer.id, reason);
        setAttentionModalOpen(false);
    };
    
    const handleClearAttentionFlag = () => {
        updateCustomerAttentionFlag(customer.id, null);
    };
    
    const handleAddressChange = (newAddress: string) => {
        updateCustomer({ ...customer, address: newAddress });
        setAddressModalOpen(false);
    };

    const handleProfileUpdate = (updatedCustomer: Customer) => {
        updateCustomer(updatedCustomer);
        setEditProfileModalOpen(false);
    };
    
    const handlePolicyUpdate = (updatedPolicy: Policy) => {
        const updatedPolicies = customer.policies.map(p => p.id === updatedPolicy.id ? updatedPolicy : p);
        updateCustomer({ ...customer, policies: updatedPolicies });
    };

    return (
        <div className="space-y-6">
            <header className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {customer.attentionFlag && (
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-md text-sm mb-4 flex justify-between items-center">
                        <div><strong>Attention:</strong> {customer.attentionFlag}</div>
                        <button onClick={handleClearAttentionFlag} className="text-xs font-semibold hover:underline">Clear</button>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{customer.firstName} {customer.lastName}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{customer.email}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <button onClick={() => setAttentionModalOpen(true)} className="px-3 py-1.5 text-sm bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-500">Set Attention</button>
                        <button onClick={() => setEditProfileModalOpen(true)} className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Edit Profile</button>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><strong className="text-gray-500 block">Phone</strong> {customer.phone || 'N/A'}</div>
                    <div><strong className="text-gray-500 block">Address</strong> {customer.address || 'N/A'} <button onClick={() => setAddressModalOpen(true)} className="text-blue-500 text-xs ml-1">Edit</button></div>
                    <div><strong className="text-gray-500 block">Policies</strong> {customer.policies.length}</div>
                </div>
            </header>
            
            <ConsentManagement customer={customer} onUpdateCustomer={updateCustomer} />

            {isLoadingFindings ? <SkeletonLoader className="h-48 w-full" /> : (
                <>
                    {pendingFindings.length > 0 && (
                        <AgentReviewPanel 
                            findings={pendingFindings} 
                            onUpdateStatus={updateFindingStatus} 
                            onUpdateContent={updateFindingContent} 
                        />
                    )}
                    {verifiedOpportunities.length > 0 && (
                        <ActionableOpportunities opportunities={verifiedOpportunities} customer={customer} />
                    )}
                </>
            )}

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('timeline')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'timeline' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Timeline</button>
                    <button onClick={() => setActiveTab('policies')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'policies' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>Policies</button>
                    <button onClick={() => setActiveTab('analysis')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analysis' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}`}>AI Gap Analysis</button>
                </nav>
            </div>

            {activeTab === 'timeline' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setAddEventModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Timeline Event</button>
                    </div>
                    <CustomerTimeline timeline={customer.timeline} onAddAnnotation={handleAddAnnotation} onFlagEvent={(eventId) => toggleTimelineEventFlag(customer.id, eventId)} />
                </div>
            )}
            
             {activeTab === 'policies' && (
                <div className="space-y-4">
                    {customer.policies.length > 0 ? (
                        customer.policies.map(policy => <DetailedPolicyView key={policy.id} policy={policy} onUpdatePolicy={handlePolicyUpdate} />)
                    ) : <p>No policies found.</p>}
                </div>
            )}
            
            {activeTab === 'analysis' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">New Policy Analysis</h2>
                    <EmbeddedGapAnalysis customer={customer} />
                    <h2 className="text-xl font-semibold pt-4 border-t dark:border-gray-700">Past Analyses</h2>
                    {isLoadingAnalyses && <SkeletonLoader className="h-32 w-full"/>}
                    {analyses.map(analysis => <StoredAnalysisCard key={analysis.id} analysis={analysis} />)}
                </div>
            )}

            <AddTimelineEventModal isOpen={isAddEventModalOpen} onClose={() => setAddEventModalOpen(false)} onSubmit={handleAddTimelineEvent} />
            <AttentionFlagModal isOpen={isAttentionModalOpen} onClose={() => setAttentionModalOpen(false)} onSubmit={handleAttentionFlagSubmit} currentReason={customer.attentionFlag} />
            <AddressChangeModal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} onSubmit={handleAddressChange} currentAddress={customer.address || ''} />
            <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)} onSubmit={handleProfileUpdate} customer={customer} />
        </div>
    );
};

export default CustomerProfile;