import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { PolicyType } from '../../types';

interface LeadControlsProps {
    sources: string[];
    preferences: {
        filters: { source: string, policyType: string };
        sorting: { key: string; order: string };
    };
    onPreferencesChange: (type: 'filter' | 'sort', key: string, value: any) => void;
}

const LeadControls: React.FC<LeadControlsProps> = ({ sources, preferences, onPreferencesChange }) => {
    const { t } = useLocalization();
    
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {/* Source Filter */}
            <div className="flex-1">
                <label htmlFor="source-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('leadGen.filterBySource')}</label>
                <select 
                    id="source-filter" 
                    value={preferences.filters.source} 
                    onChange={(e) => onPreferencesChange('filter', 'source', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="all">{t('leadGen.allSources')}</option>
                    {sources.map(source => <option key={source} value={source}>{source}</option>)}
                </select>
            </div>
            {/* Policy Type Filter */}
            <div className="flex-1">
                <label htmlFor="policy-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('leadGen.filterByPolicy')}</label>
                <select 
                    id="policy-filter" 
                    value={preferences.filters.policyType} 
                    onChange={(e) => onPreferencesChange('filter', 'policyType', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="all">{t('leadGen.allPolicies')}</option>
                    {Object.values(PolicyType).map((pt: string) => <option key={pt} value={pt}>{t(`policyTypes.${pt}`)}</option>)}
                </select>
            </div>
            {/* Sorting */}
            <div className="flex-1">
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('leadGen.sortBy')}</label>
                <select 
                    id="sort-by" 
                    value={`${preferences.sorting.key}-${preferences.sorting.order}`} 
                    onChange={(e) => onPreferencesChange('sort', 'sorting', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                    <option value="createdAt-desc">{t('leadGen.dateDesc')}</option>
                    <option value="createdAt-asc">{t('leadGen.dateAsc')}</option>
                    <option value="name-asc">{t('leadGen.nameAsc')}</option>
                    <option value="name-desc">{t('leadGen.nameDesc')}</option>
                    <option value="potentialValue-desc">{t('leadGen.valueDesc')}</option>
                    <option value="potentialValue-asc">{t('leadGen.valueAsc')}</option>
                </select>
            </div>
        </div>
    );
};

export default LeadControls;