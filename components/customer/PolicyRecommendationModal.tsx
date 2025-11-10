import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Policy } from '../../types';

interface PolicyRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy;
  recommendation: string | null;
  isLoading: boolean;
}

const PolicyRecommendationModal: React.FC<PolicyRecommendationModalProps> = ({ isOpen, onClose, policy, recommendation, isLoading }) => {
  const { t } = useLocalization();

  if (!isOpen) return null;
  
  const renderContent = () => {
    if (isLoading) {
      return (
          <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>{t('customer.aiAnalyzing')}</p>
          </div>
      );
    }
    
    if (!recommendation) {
        return <p className="text-center p-8">{t('customer.aiNoResponse')}</p>;
    }

    // Using a simple pre-wrap to display formatted text from Gemini
    return (
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {recommendation}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">{t('customer.aiReviewTitle')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('customer.forPolicy')} {policy.policyNumber}</p>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
            {renderContent()}
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyRecommendationModal;
