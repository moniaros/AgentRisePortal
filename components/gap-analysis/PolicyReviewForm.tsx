import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface PolicyReviewFormProps {
  userNeeds: string;
  setUserNeeds: (needs: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PolicyReviewForm: React.FC<PolicyReviewFormProps> = ({ userNeeds, setUserNeeds, onSubmit, isLoading }) => {
  const { t } = useLocalization();

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">{t('gapAnalysis.userNeedsTitle')}</h3>
      <textarea
        value={userNeeds}
        onChange={(e) => setUserNeeds(e.target.value)}
        placeholder={t('gapAnalysis.userNeedsPlaceholder')}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
        disabled={isLoading}
      />
      <button
        onClick={onSubmit}
        disabled={isLoading || !userNeeds}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {isLoading ? t('gapAnalysis.analyzing') : t('gapAnalysis.analyzeGaps')}
      </button>
    </div>
  );
};

export default PolicyReviewForm;
