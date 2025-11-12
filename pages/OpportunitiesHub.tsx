import React, { useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAllVerifiedOpportunities } from '../hooks/useAllVerifiedOpportunities';
import { getStoredFindings } from '../services/findingsStorage';
import { useCrmData } from '../hooks/useCrmData';
import { StoredFinding, Customer } from '../types';
import { useAuth } from '../hooks/useAuth';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { Link } from 'react-router-dom';

const OpportunitiesHub: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { customers } = useCrmData();
    const { isLoading } = useAllVerifiedOpportunities(); // Reuse for loading state

    const opportunitiesByCustomer = useMemo(() => {
        if (!currentUser?.agencyId) return new Map();

        const allFindings = getStoredFindings(currentUser.agencyId);
        const verifiedOpps = allFindings.filter(f => f.status === 'verified' && (f.type === 'upsell' || f.type === 'cross-sell'));

        const grouped = new Map<string, { customer: Customer | undefined, opportunities: StoredFinding[] }>();

        verifiedOpps.forEach(opp => {
            if (!grouped.has(opp.customerId)) {
                const customer = customers.find(c => c.id === opp.customerId);
                grouped.set(opp.customerId, { customer, opportunities: [] });
            }
            grouped.get(opp.customerId)!.opportunities.push(opp);
        });

        return grouped;
    }, [currentUser, customers]);
    
    if (isLoading) {
        return (
            <div className="space-y-4">
                <SkeletonLoader className="h-16 w-full" />
                <SkeletonLoader className="h-32 w-full" />
                <SkeletonLoader className="h-32 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('pipeline.opportunitiesHub.title')}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 max-w-2xl">{t('pipeline.opportunitiesHub.description')}</p>
            </div>
            
            <div className="space-y-4">
                {Array.from(opportunitiesByCustomer.entries()).map(([customerId, { customer, opportunities }]) => (
                    <div key={customerId} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-3">
                             <h2 className="text-xl font-semibold">
                                {customer ? `${customer.firstName} ${customer.lastName}` : `Customer ID: ${customerId}`}
                            </h2>
                            <Link to={`/customer/${customerId}`} className="text-sm text-blue-500 hover:underline">
                                View Profile &rarr;
                            </Link>
                        </div>
                       
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {opportunities.map(opp => (
                                <div key={opp.id} className={`p-3 rounded-md border-l-4 ${opp.type === 'upsell' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'}`}>
                                    <h3 className="font-semibold text-sm">{opp.title}</h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{opp.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {opportunitiesByCustomer.size === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500">No active opportunities found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OpportunitiesHub;
