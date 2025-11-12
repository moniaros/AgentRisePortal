import React from 'react';
import { Opportunity__EXT } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface OpportunityCardProps {
    opportunity: Opportunity__EXT;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
    const { t } = useLocalization();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'contacted': return 'border-yellow-500';
            case 'qualified': return 'border-blue-500';
            case 'won': return 'border-green-500';
            case 'lost': return 'border-red-500';
            default: return 'border-gray-300';
        }
    };

    return (
        <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 ${getStatusColor(opportunity.stage)}`}>
            <div className="flex justify-between items-center">
                <p className="font-semibold text-lg">€{opportunity.value.toLocaleString()}</p>
                <span className="text-xs font-semibold capitalize px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">{opportunity.stage}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('dashboard.kpis.followUp')}: {new Date(opportunity.nextFollowUpDate).toLocaleDateString()}
            </p>
        </div>
    );
};

export default OpportunityCard;
