import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { RuleCategory } from '../../types';

interface CategoryBadgeProps {
  category: RuleCategory;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const { t } = useLocalization();

  const colors: Record<RuleCategory, string> = {
    lead_conversion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    communication_automation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[category]}`}>
      {t(`automationRules.categories.${category}`)}
    </span>
  );
};

export default CategoryBadge;