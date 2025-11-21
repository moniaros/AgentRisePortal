
import React, { useMemo, useState } from 'react';
import { usePipelineData } from '../hooks/usePipelineData';
import { useLocalization } from '../hooks/useLocalization';
import { useNotification } from '../hooks/useNotification';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import LeadRow from '../components/pipeline/LeadsInbox/LeadRow';
import LeadQuickView from '../components/pipeline/LeadsInbox/LeadQuickView';
import { TransactionInquiry } from '../types';

const LeadsInbox: React.FC = () => {
    const { t } = useLocalization();
    const { addNotification } = useNotification();
    const { inquiries, opportunities, isLoading, error, createOpportunity } = usePipelineData();
    
    const [selectedInquiry, setSelectedInquiry] = useState<TransactionInquiry | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'hot' | 'referral' | 'quote'>('all');

    const unassignedInquiries = useMemo(() => {
        if (isLoading || !inquiries || !opportunities) return [];
        const opportunityInquiryIds = new Set(opportunities.map(opp => opp.inquiryId));
        
        let filtered = inquiries
            .filter(inquiry => !opportunityInquiryIds.has(inquiry.id))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (activeFilter === 'hot') {
            // Mock logic for "Hot": New leads from last 24h or Quote Requests
            const now = Date.now();
            filtered = filtered.filter(i => 
                (now - new Date(i.createdAt).getTime() < 86400000) || i.purpose === 'quote_request'
            );
        } else if (activeFilter === 'referral') {
            filtered = filtered.filter(i => i.source === 'Referral');
        } else if (activeFilter === 'quote') {
            filtered = filtered.filter(i => i.purpose === 'quote_request');
        }

        return filtered;
    }, [inquiries, opportunities, isLoading, activeFilter]);

    const handleCreateOpportunity = (inquiry: TransactionInquiry) => {
        createOpportunity(inquiry);
        addNotification(t('pipeline.opportunityCreated'), 'success');
        setSelectedInquiry(null); // Close drawer if open
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <SkeletonLoader key={i} className="h-24 w-full" />)}
                </div>
            );
        }

        if (error) {
            return <ErrorMessage message={error.message} />;
        }

        if (unassignedInquiries.length === 0) {
            return (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <p className="text-lg text-gray-500">{t('pipeline.noNewLeads')}</p>
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md divide-y dark:divide-gray-700">
                {unassignedInquiries.map(inquiry => (
                    <LeadRow 
                        key={inquiry.id} 
                        inquiry={inquiry} 
                        onCreateOpportunity={handleCreateOpportunity}
                        onViewDetails={() => setSelectedInquiry(inquiry)}
                    />
                ))}
            </div>
        );
    };

    const FilterButton: React.FC<{ id: string; label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${isActive ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6 relative">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('pipeline.inboxTitle')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">{t('pipeline.inboxDescription')}</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                <FilterButton id="all" label="All Leads" isActive={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
                <FilterButton id="hot" label="🔥 Hot Leads" isActive={activeFilter === 'hot'} onClick={() => setActiveFilter('hot')} />
                <FilterButton id="quote" label="💰 Quote Requests" isActive={activeFilter === 'quote'} onClick={() => setActiveFilter('quote')} />
                <FilterButton id="referral" label="🤝 Referrals" isActive={activeFilter === 'referral'} onClick={() => setActiveFilter('referral')} />
            </div>

            {renderContent()}

            <LeadQuickView 
                inquiry={selectedInquiry} 
                isOpen={!!selectedInquiry} 
                onClose={() => setSelectedInquiry(null)} 
                onCreateOpportunity={handleCreateOpportunity} 
            />
        </div>
    );
};

export default LeadsInbox;
