import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { AuditLog } from '../../types';

interface AuditLogFiltersProps {
    filters: {
        search: string;
        action: 'all' | AuditLog['action'];
    };
    onFilterChange: (filters: { search: string; action: 'all' | AuditLog['action'] }) => void;
}

const auditActions: AuditLog['action'][] = ['user_invited', 'user_removed', 'role_changed'];

const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({ filters, onFilterChange }) => {
    const { t } = useLocalization();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, search: e.target.value });
    };

    const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, action: e.target.value as 'all' | AuditLog['action'] });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <input
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder={t('userManagement.filters.searchLogs')}
                className="w-full sm:w-1/2 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            <select
                value={filters.action}
                onChange={handleActionChange}
                className="w-full sm:w-1/4 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
                <option value="all">{t('userManagement.filters.allActions')}</option>
                {auditActions.map(action => (
                    <option key={action} value={action}>{t(`userManagement.log.actions.${action}`)}</option>
                ))}
            </select>
        </div>
    );
};

export default AuditLogFilters;
