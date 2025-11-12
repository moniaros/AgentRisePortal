import React from 'react';
import { Opportunity__EXT, Prospect, OpportunityStage } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface MyDayListProps {
    title: string;
    opportunities: Opportunity__EXT[];
    prospects: Prospect[];
    onUpdateStage: (opportunityId: string, newStage: OpportunityStage) => void;
    variant?: 'default' | 'danger' | 'info';
}

const MyDayList: React.FC<MyDayListProps> = ({ title, opportunities, prospects, onUpdateStage, variant = 'default' }) => {
    const { t } = useLocalization();

    const variantClasses = {
        default: 'border-gray-300 dark:border-gray-600',
        danger: 'border-red-500',
        info: 'border-blue-500',
    };

    if (opportunities.length === 0) {
        return null;
    }

    return (
        <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${variantClasses[variant]}`}>
            <h2 className="text-xl font-semibold mb-4">{title} ({opportunities.length})</h2>
            <div className="space-y-3">
                {opportunities.map(opp => {
                    const prospect = prospects.find(p => p.id === opp.prospectId);
                    return (
                        <div key={opp.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="font-semibold">{opp.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{prospect?.firstName} {prospect?.lastName} - €{opp.value.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="date" defaultValue={opp.nextFollowUpDate?.split('T')[0]} className="p-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600" />
                                <select 
                                    value={opp.stage} 
                                    onChange={(e) => onUpdateStage(opp.id, e.target.value as OpportunityStage)}
                                    className="p-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600 capitalize"
                                >
                                    {(['new', 'contacted', 'proposal', 'won', 'lost'] as OpportunityStage[]).map(stage => (
                                        <option key={stage} value={stage}>{t(`pipeline.stages.${stage}`)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyDayList;
