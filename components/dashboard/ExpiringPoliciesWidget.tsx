
import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../ui/SkeletonLoader';

interface ExpiringPolicyInfo {
    customerId: string;
    customerName: string;
    policyNumber: string;
    endDate: string;
}

interface ExpiringPoliciesWidgetProps {
    policies: ExpiringPolicyInfo[];
    isLoading: boolean;
}

const ExpiringPoliciesWidget: React.FC<ExpiringPoliciesWidgetProps> = ({ policies, isLoading }) => {
    const { t } = useLocalization();
    const navigate = useNavigate();

    const calculateDaysRemaining = (endDateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(endDateStr);
        const diffTime = endDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <SkeletonLoader key={i} className="h-12 w-full" />)}
                </div>
            );
        }

        if (policies.length === 0) {
            return <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">{t('dashboard.noPoliciesExpireSoon')}</p>;
        }

        return (
            <ul className="space-y-3">
                {policies.map(policy => {
                    const daysRemaining = calculateDaysRemaining(policy.endDate);
                    const isUrgent = daysRemaining <= 7;
                    let expiresText;
                    if (daysRemaining <= 0) {
                        expiresText = t('dashboard.expiresToday');
                    } else {
                        expiresText = t('dashboard.expiresIn', { days: daysRemaining });
                    }

                    return (
                        <li key={policy.policyNumber} 
                            onClick={() => navigate(`/customer/${policy.customerId}`)}
                            className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{policy.customerName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{policy.policyNumber}</p>
                                </div>
                                <span className={`text-xs font-bold ${isUrgent ? 'text-red-500' : 'text-yellow-500'}`}>
                                    {expiresText}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {t('dashboard.policiesExpiringSoon')}
            </h2>
            <div className="overflow-y-auto max-h-64 pr-2">
                {renderContent()}
            </div>
        </div>
    );
};

export default ExpiringPoliciesWidget;
