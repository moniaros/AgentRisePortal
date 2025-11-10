import React, { useState } from 'react';
import { Policy } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface PolicyCardProps {
  policy: Policy;
  onRenew: (policy: Policy) => void;
  onAiReview: (policy: Policy) => void;
  isAiLoading: boolean;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onRenew, onAiReview, isAiLoading }) => {
    const { t } = useLocalization();
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);

    const getPolicyIcon = (type: string) => {
        switch (type) {
            case 'auto': return '🚗';
            case 'home': return '🏠';
            case 'life': return '❤️';
            case 'health': return '⚕️';
            default: return '📄';
        }
    };

    const today = new Date();
    const endDate = new Date(policy.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isExpired = diffDays < 0;
    const needsRenewal = diffDays >= 0 && diffDays <= 60;

    const statusClass = policy.isActive && !isExpired
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    const statusText = policy.isActive && !isExpired
        ? t('statusLabels.active')
        : (isExpired ? t('statusLabels.expired') : t('statusLabels.inactive'));

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="text-4xl">{getPolicyIcon(policy.type)}</div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t(`policyTypes.${policy.type}`)} - {policy.policyNumber}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{policy.insurer}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                                {statusText}
                            </span>
                            {needsRenewal && !isExpired && (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    {t('customer.renewalNeeded')}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                            <p className="font-semibold text-gray-600 dark:text-gray-300">{t('crm.form.premium')}</p>
                            <p>€{policy.premium.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-600 dark:text-gray-300">{t('crm.form.startDate')}</p>
                            <p>{new Date(policy.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-600 dark:text-gray-300">{t('crm.form.endDate')}</p>
                            <p>{new Date(policy.endDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                <div className="w-full sm:w-auto mt-4 sm:mt-0 flex flex-col space-y-2 flex-shrink-0">
                    <button 
                        onClick={() => onRenew(policy)}
                        disabled={!needsRenewal && !isExpired}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {t('customer.renewPolicy')}
                    </button>
                    <button 
                        onClick={() => onAiReview(policy)}
                        disabled={isAiLoading}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:bg-gray-400"
                    >
                        {isAiLoading ? '...' : t('customer.aiReview')}
                    </button>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => setIsDetailsVisible(!isDetailsVisible)}
                    className="text-sm text-blue-500 hover:underline"
                >
                    {isDetailsVisible ? t('customer.hideDetails') : t('customer.showDetails')}
                </button>
                {isDetailsVisible && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('customer.coverages')}</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Coverage Type</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">{t('customer.limit')}</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">{t('customer.deductible')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {policy.coverages.map((cov, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">{cov.type}</td>
                                            <td className="px-4 py-2">{cov.limit}</td>
                                            <td className="px-4 py-2">{cov.deductible || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyCard;