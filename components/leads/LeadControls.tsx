import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Lead } from '../../types';

interface LeadControlsProps {
    filters: {
        status: string;
        source: string;
        search: string;
    };
    onFilterChange: React.Dispatch<React.SetStateAction<any>>;
    allLeads: Lead[];
}

const LeadControls: React.FC<LeadControlsProps> = ({ filters, onFilterChange, allLeads }) => {
    const { t } = useLocalization();

    const uniqueSources = [...new Set(allLeads.map(lead => lead.source))];
    const statuses = ['new', 'contacted', 'qualified', 'closed', 'rejected'];

    const handleFilterChange = (key: string, value: string) => {
        onFilterChange((prev: any) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder={t('leads.searchPlaceholder')}
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="all">{t('leads.allStatuses')}</option>
                    {statuses.map(status => (
                        <option key={status} value={status} className="capitalize">{t(`statusLabels.${status}`)}</option>
                    ))}
                </select>
                <select
                    value={filters.source}
                    onChange={(e) => handleFilterChange('source', e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="all">{t('leads.allSources')}</option>
                    {uniqueSources.map(source => (
                        <option key={source} value={source}>{source}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LeadControls;
