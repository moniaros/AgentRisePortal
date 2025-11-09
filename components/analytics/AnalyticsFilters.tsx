import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Campaign, Language } from '../../types';

interface AnalyticsFiltersProps {
    campaigns: Campaign[];
    filters: {
        campaignId: string;
        network: string;
        period: number;
        language: string;
    };
    onFilterChange: React.Dispatch<React.SetStateAction<any>>;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({ campaigns, filters, onFilterChange }) => {
    const { t } = useLocalization();
    const networks = [...new Set(campaigns.map(c => c.network))];

    const handleFilterChange = (key: string, value: string | number) => {
        onFilterChange((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {/* Campaign Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('analytics.filters.campaign')}</label>
                <select value={filters.campaignId} onChange={e => handleFilterChange('campaignId', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option value="all">{t('analytics.filters.allCampaigns')}</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            {/* Network Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('analytics.filters.network')}</label>
                <select value={filters.network} onChange={e => handleFilterChange('network', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option value="all">{t('analytics.filters.allNetworks')}</option>
                    {networks.map(n => <option key={n} value={n} className="capitalize">{n}</option>)}
                </select>
            </div>
            {/* Period Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('analytics.filters.period')}</label>
                <select value={filters.period} onChange={e => handleFilterChange('period', parseInt(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option value={7}>{t('analytics.filters.last7')}</option>
                    <option value={30}>{t('analytics.filters.last30')}</option>
                    <option value={90}>{t('analytics.filters.last90')}</option>
                </select>
            </div>
             {/* Language Filter */}
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('analytics.filters.language')}</label>
                <select value={filters.language} onChange={e => handleFilterChange('language', e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option value="all">{t('analytics.filters.allLanguages')}</option>
                    <option value={Language.EN}>English</option>
                    <option value={Language.EL}>Greek</option>
                </select>
            </div>
        </div>
    );
};

export default AnalyticsFilters;