import React, { useState } from 'react';
import { User, UserSystemRole, LicenseStatus } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';

interface UsersTableProps {
    users: User[];
    selectedUserIds: Set<string>;
    onSelectUser: (userId: string) => void;
    onSelectAllUsers: () => void;
    onRemove: (userId: string) => void;
    onChangeRole: (userId: string, newRole: UserSystemRole) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
    users,
    selectedUserIds,
    onSelectUser,
    onSelectAllUsers,
    onRemove,
    onChangeRole,
}) => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { addNotification } = useNotification();
    const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);

    const handleConfirmRemove = (user: User) => {
        if (user.id === currentUser?.id) {
            addNotification(t('userManagement.cannotRemoveSelf') as string, 'warning');
            return;
        }
        onRemove(user.id);
        setConfirmingRemoveId(null);
    };

    const isAllSelected = users.length > 0 && selectedUserIds.size === users.length;
    const isIndeterminate = selectedUserIds.size > 0 && selectedUserIds.size < users.length;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="p-4 w-10">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={isAllSelected}
                                ref={(el) => {
                                    if (el) el.indeterminate = isIndeterminate;
                                }}
                                onChange={onSelectAllUsers}
                            />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left">
                            {t('crm.name')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left">
                            {t('userManagement.role')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left">
                            EU IDD / BoG License
                        </th>
                        <th scope="col" className="px-6 py-3 text-right">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 tabular-nums">
                    {users.map((user) => {
                        const primaryLicense = user.partyRole.licenses?.[0];
                        return (
                            <tr
                                key={user.id}
                                className={
                                    selectedUserIds.has(user.id)
                                        ? 'bg-blue-50/60 dark:bg-blue-900/20'
                                        : 'hover:bg-gray-50/70 dark:hover:bg-gray-700/30'
                                }
                            >
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedUserIds.has(user.id)}
                                        onChange={() => onSelectUser(user.id)}
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {user.party.partyName.firstName}{' '}
                                        {user.party.partyName.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {user.party.contactInfo.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap capitalize text-gray-700 dark:text-gray-300">
                                    {user.partyRole.roleType}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {primaryLicense ? (
                                        <div>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                                    primaryLicense.status === LicenseStatus.VALID
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                }`}
                                            >
                                                {primaryLicense.type} #{primaryLicense.licenseNumber}
                                            </span>
                                            <span className="block text-xs text-gray-400 mt-0.5">
                                                Exp. {primaryLicense.expirationDate}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">
                                            Executive / Non-Producing Admin
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-3">
                                    <select
                                        value={user.partyRole.roleType}
                                        onChange={(e) =>
                                            onChangeRole(
                                                user.id,
                                                e.target.value as UserSystemRole
                                            )
                                        }
                                        className="px-2 py-1 border border-gray-300 rounded-md text-xs dark:bg-gray-700 dark:border-gray-600"
                                        disabled={user.id === currentUser?.id}
                                    >
                                        <option value="agent">{t('userManagement.agent')}</option>
                                        <option value="admin">{t('userManagement.admin')}</option>
                                    </select>

                                    {confirmingRemoveId === user.id ? (
                                        <span className="inline-flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleConfirmRemove(user)}
                                                className="px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => setConfirmingRemoveId(null)}
                                                className="px-2 py-1 text-xs text-gray-500 hover:underline"
                                            >
                                                Cancel
                                            </button>
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmingRemoveId(user.id)}
                                            className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400 disabled:opacity-40"
                                            disabled={user.id === currentUser?.id}
                                        >
                                            {t('userManagement.removeUser')}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;
