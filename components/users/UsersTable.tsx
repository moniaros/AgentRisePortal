import React from 'react';
// FIX: Module '"../../types"' has no exported member 'UserRole'. Use 'UserSystemRole' instead and fix import path.
import { User, UserSystemRole } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth';

interface UsersTableProps {
  users: User[];
  selectedUserIds: Set<string>;
  onSelectUser: (userId: string) => void;
  onSelectAllUsers: () => void;
  onRemove: (userId: string) => void;
  onChangeRole: (userId: string, newRole: UserSystemRole) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, selectedUserIds, onSelectUser, onSelectAllUsers, onRemove, onChangeRole }) => {
  const { t } = useLocalization();
  const { currentUser } = useAuth();
  
  const handleRemove = (user: User) => {
    if (user.id === currentUser?.id) {
      alert(t('userManagement.cannotRemoveSelf'));
      return;
    }
    // FIX: Property 'name' does not exist on type 'User'. Use party.partyName properties instead.
    if (window.confirm(t('userManagement.confirmRemove').replace('{userName}', `${user.party.partyName.firstName} ${user.party.partyName.lastName}`))) {
        onRemove(user.id);
    }
  };

  const isAllSelected = users.length > 0 && selectedUserIds.size === users.length;
  const isIndeterminate = selectedUserIds.size > 0 && selectedUserIds.size < users.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="p-4">
              <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={isAllSelected}
                // Fix: Ensure the ref callback doesn't return a value to match the expected `void` return type.
                ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                onChange={onSelectAllUsers}
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.name')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('userManagement.role')}</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {users.map(user => (
            <tr key={user.id} className={selectedUserIds.has(user.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
              <td className="p-4">
                <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedUserIds.has(user.id)}
                    onChange={() => onSelectUser(user.id)}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {/* FIX: Property 'name' does not exist on type 'User'. Use party.partyName properties instead. */}
                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.party.partyName.firstName} {user.party.partyName.lastName}</div>
                {/* FIX: Property 'email' does not exist on type 'User'. Use party.contactInfo.email instead. */}
                <div className="text-sm text-gray-500 dark:text-gray-400">{user.party.contactInfo.email}</div>
              </td>
              {/* FIX: Property 'role' does not exist on type 'User'. Use partyRole.roleType instead. */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{user.partyRole.roleType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                 <select 
                    value={user.partyRole.roleType}
                    onChange={(e) => onChangeRole(user.id, e.target.value as UserSystemRole)}
                    className="p-1 border rounded-md text-xs dark:bg-gray-700 dark:border-gray-600"
                    disabled={user.id === currentUser?.id}
                >
                    <option value="agent">{t('userManagement.agent')}</option>
                    <option value="admin">{t('userManagement.admin')}</option>
                </select>
                <button 
                    onClick={() => handleRemove(user)} 
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 disabled:opacity-50"
                    disabled={user.id === currentUser?.id}
                >
                    {t('userManagement.removeUser')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
