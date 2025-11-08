import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Policy } from '../../types';

interface PolicyParserProps {
  parsedPolicy: Partial<Policy> | null;
  isLoading: boolean;
}

const PolicyParser: React.FC<PolicyParserProps> = ({ parsedPolicy, isLoading }) => {
  const { t } = useLocalization();

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>{t('gapAnalysis.parsingPolicy')}</p>
      </div>
    );
  }

  if (!parsedPolicy) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-semibold mb-4">{t('gapAnalysis.extractedInfo')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{t('crm.form.policyNumber')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{parsedPolicy.policyNumber || 'N/A'}</p>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{t('crm.form.insurer')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{parsedPolicy.insurer || 'N/A'}</p>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{t('crm.form.premium')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{parsedPolicy.premium ? `€${parsedPolicy.premium}` : 'N/A'}</p>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{t('crm.form.startDate')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{parsedPolicy.startDate || 'N/A'}</p>
        </div>
         <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{t('crm.form.endDate')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{parsedPolicy.endDate || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default PolicyParser;
