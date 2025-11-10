import React from 'react';
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

  const getStatusClasses = () => {
    if (!policy.isActive) return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500', label: t('policyStatus.inactive') };
    
    const endDate = new Date(policy.endDate);
    const today = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: t('policyStatus.expired') };
    if (daysRemaining <= 30) return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: t('policyStatus.expiringSoon') };
    return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: t('policyStatus.active') };
  };

  const status = getStatusClasses();
  const policyTypeName = t(`policyTypes.${policy.type}`) || policy.type;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: policy.isActive ? '#3b82f6' : '#6b7280' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold">{policyTypeName}</h3>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('crm.form.policyNumber')}: {policy.policyNumber}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => onAiReview(policy)} disabled={isAiLoading} className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1">
            {isAiLoading ? '...' : '✨'} {t('customer.aiReview')}
          </button>
          <button onClick={() => onRenew(policy)} disabled={!policy.isActive} className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded hover:bg-blue-200 disabled:opacity-50">
            {t('customer.renew')}
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t dark:border-gray-700 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <label className="block text-xs text-gray-500">{t('crm.form.premium')}</label>
          <p className="font-semibold">€{policy.premiumAmount.toFixed(2)}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500">{t('crm.form.startDate')}</label>
          <p>{new Date(policy.startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <label className="block text-xs text-gray-500">{t('crm.form.endDate')}</label>
          <p>{new Date(policy.endDate).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;