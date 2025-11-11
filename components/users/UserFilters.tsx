import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
// FIX: Module '"../../types"' has no exported member 'UserRole'. Use 'UserSystemRole' instead.
import { UserSystemRole } from '../../types';

interface UserFiltersProps {
    filters: {
        search: string;
        role: 'all' | UserSystemRole;
    };
    onFilterChange: (filters: { search: string; role: 'all' | UserSystemRole }) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({ filters, onFilterChange }) => {
    const { t } = useLocalization();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, search: e.target.value });
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange({ ...filters, role: e.target.value as 'all' | UserSystemRole });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <input
                type="text"
                value={filters.search}
                onChange={handleSearchChange}
                placeholder={t('userManagement.filters.searchByNameEmail')}
                className="w-full sm:w-1/2 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            <select
                value={filters.role}
                onChange={handleRoleChange}
                className="w-full sm:w-1/4 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
                <option value="all">{t('userManagement.filters.allRoles')}</option>
                <option value="admin">{t('userManagement.admin')}</option>
                <option value="agent">{t('userManagement.agent')}</option>
            </select>
        </div>
    );
};

export default UserFilters;