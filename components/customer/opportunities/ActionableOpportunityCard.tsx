import React from 'react';
import { StoredFinding, Customer } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface ActionableOpportunityCardProps {
    opportunity: StoredFinding;
    customer: Customer;
}

const getIconForType = (type: StoredFinding['type']) => {
    switch (type) {
        case 'upsell': return { icon: '💡', color: 'border-blue-500' };
        case 'cross-sell': return { icon: '➕', color: 'border-purple-500' };
        default: return { icon: '📌', color: 'border-gray-500' };
    }
};

const ActionableOpportunityCard: React.FC<ActionableOpportunityCardProps> = ({ opportunity, customer }) => {
    const { t } = useLocalization();
    const { icon, color } = getIconForType(opportunity.type);

    const emailSubject = `Regarding: ${opportunity.title}`;
    const emailBody = `Hi ${customer.firstName},\n\nI was reviewing your current policies and identified a potential opportunity that might benefit you: ${opportunity.title}.\n\n${opportunity.description}\n\nWould you be open to a quick chat about this?\n\nBest,`;

    return (
        <div className={`p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 ${color} flex flex-col justify-between`}>
            <div>
                <h4 className="font-semibold flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    {opportunity.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{opportunity.description}</p>
                {opportunity.benefit && (
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-2">
                        <strong>Benefit:</strong> {opportunity.benefit}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t dark:border-gray-700">
                {customer.phone && (
                    <a href={`tel:${customer.phone}`} className="px-3 py-1.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 rounded-full hover:bg-green-200">
                        {t('customer.opportunities.callNow')}
                    </a>
                )}
                <a href={`mailto:${customer.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`} className="px-3 py-1.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded-full hover:bg-blue-200">
                    {t('customer.opportunities.sendEmail')}
                </a>
            </div>
        </div>
    );
};

export default ActionableOpportunityCard;