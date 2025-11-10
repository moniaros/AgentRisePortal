import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
// FIX: Module '"../../types"' has no exported member 'UserRole'. Use 'UserSystemRole' instead.
import { UserSystemRole } from '../../types';

interface BulkActionsToolbarProps {
    selectedIds: Set<string>;
    onBulkDelete: () => void;
    onBulkRoleChange: (newRole: UserSystemRole) => void;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({ selectedIds, onBulkDelete, onBulkRoleChange }) => {
    const { t } = useLocalization();
    const selectedCount = selectedIds.size;

    if (selectedCount === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-between p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                {t('userManagement.bulkActions.selected').replace('{count}', String(selectedCount))}
            </span>
            <div className="flex items-center gap-2">
                <select 
                    onChange={(e) => onBulkRoleChange(e.target.value as UserSystemRole)}
                    className="p-2 border rounded-md text-xs dark:bg-gray-700 dark:border-gray-600"
                    defaultValue=""
                >
                    <option value="" disabled>{t('userManagement.bulkActions.changeRoleTo')}</option>
                    <option value="admin">{t('userManagement.admin')}</option>
                    <option value="agent">{t('userManagement.agent')}</option>
                </select>
                <button
                    onClick={onBulkDelete}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    {t('userManagement.bulkActions.deleteSelected')}
                </button>
            </div>
        </div>
    );
};

export default BulkActionsToolbar;
