import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { RuleCategory } from '../../types';

interface CategoryBadgeProps {
  category: RuleCategory;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const { t } = useLocalization();

  const colors: Record<RuleCategory, string> = {
    renewal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    payment: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    lead_assignment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    task_creation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[category]}`}>
      {t(`automationRules.categories.${category}`)}
    </span>
  );
};

export default CategoryBadge;
