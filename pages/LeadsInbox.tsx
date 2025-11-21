
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

    const unassignedInquiries = useMemo(() => {
        if (isLoading || !inquiries || !opportunities) return [];
        const opportunityInquiryIds = new Set(opportunities.map(opp => opp.inquiryId));
        return inquiries
            .filter(inquiry => !opportunityInquiryIds.has(inquiry.id))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [inquiries, opportunities, isLoading]);

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

    return (
        <div className="space-y-6 relative">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('pipeline.inboxTitle')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">{t('pipeline.inboxDescription')}</p>
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
