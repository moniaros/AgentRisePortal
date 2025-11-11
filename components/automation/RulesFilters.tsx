import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { RuleCategory } from '../../types';

interface RulesFiltersProps {
    filters: {
        search: string;
        category: 'all' | RuleCategory;
        status: 'all' | 'active' | 'inactive';
    };
    onFilterChange: React.Dispatch<React.SetStateAction<any>>;
}

const categories: RuleCategory[] = ['renewal', 'payment', 'lead_assignment', 'task_creation'];

const RulesFilters: React.FC<RulesFiltersProps> = ({ filters, onFilterChange }) => {
    const { t } = useLocalization();

    const handleFilterChange = (key: string, value: string) => {
        onFilterChange((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
                type="text"
                placeholder={t('automationRules.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
                <option value="all">{t('automationRules.allCategories')}</option>
                {categories.map(cat => (
                    <option key={cat} value={cat}>{t(`automationRules.categories.${cat}`)}</option>
                ))}
            </select>
            <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
                <option value="all">{t('common.all')}</option>
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
            </select>
        </div>
    );
};

export default RulesFilters;
