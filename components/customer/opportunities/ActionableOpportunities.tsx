import React from 'react';
import { StoredFinding, Customer } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import ActionableOpportunityCard from './ActionableOpportunityCard';

interface ActionableOpportunitiesProps {
    opportunities: StoredFinding[];
    customer: Customer;
}

const ActionableOpportunities: React.FC<ActionableOpportunitiesProps> = ({ opportunities, customer }) => {
    const { t } = useLocalization();

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">{t('customer.opportunities.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opportunities.map(opp => (
                    <ActionableOpportunityCard 
                        key={opp.id} 
                        opportunity={opp} 
                        customer={customer} 
                    />
                ))}
            </div>
        </div>
    );
};

export default ActionableOpportunities;