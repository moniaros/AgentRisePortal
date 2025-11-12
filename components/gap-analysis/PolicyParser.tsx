import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
// FIX: Correct import path
import { DetailedPolicy } from '../../types';

interface PolicyParserProps {
  parsedPolicy: DetailedPolicy | null;
  isLoading: boolean;
}

const PolicyParser: React.FC<PolicyParserProps> = ({ parsedPolicy, isLoading }) => {
  const { t } = useLocalization();

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>{t('gapAnalysis.fetchingPolicy')}</p>
      </div>
    );
  }

  if (!parsedPolicy) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
      <h3 className="text-xl font-semibold mb-4">{t('gapAnalysis.extractedInfo')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-4 border-b dark:border-gray-700">
        <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{t('gapAnalysis.policyHolder')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{parsedPolicy.policyholder.name}</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{parsedPolicy.policyholder.address}</p>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">{t('crm.form.policyNumber')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{parsedPolicy.policyNumber} ({parsedPolicy.insurer})</p>
        </div>
      </div>
      
      <h4 className="text-lg font-semibold mb-3">{t('gapAnalysis.insuredItems')}</h4>
      <div className="space-y-4">
        {parsedPolicy.insuredItems.map(item => (
            <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <p className="font-semibold">{item.description}</p>
                <ul className="mt-2 text-xs grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                    {item.coverages.map(coverage => (
                        <li key={coverage.type}>
                            <span className="text-gray-600 dark:text-gray-400">{coverage.type}:</span>
                            <strong className="ml-1">{coverage.limit}</strong>
                            {coverage.deductible && <span className="text-gray-500 text-xs"> (Ded: {coverage.deductible})</span>}
                        </li>
                    ))}
                </ul>
            </div>
        ))}
      </div>
    </div>
  );
};

export default PolicyParser;