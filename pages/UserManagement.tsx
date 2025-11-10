import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useUserManagementData } from '../hooks/useUserManagementData';
import UsersTable from '../components/users/UsersTable';
import AuditLogsTable from '../components/users/AuditLogsTable';
import InviteUserModal from '../components/users/InviteUserModal';
import UserFilters from '../components/users/UserFilters';
import AuditLogFilters from '../components/users/AuditLogFilters';
import BulkActionsToolbar from '../components/users/BulkActionsToolbar';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { User, UserRole, AuditLog } from '../types';

const UserManagement: React.FC = () => {
    const { t } = useLocalization();
    const { users, auditLogs, isLoading, error, addUser, removeUser, changeUserRole } = useUserManagementData();

    const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    
    // State for Users tab
    const [userFilters, setUserFilters] = useState<{ search: string; role: 'all' | UserRole }>({ search: '', role: 'all' });
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

    // State for Logs tab
    const [auditLogFilters, setAuditLogFilters] = useState<{ search: string; action: 'all' | AuditLog['action'] }>({ search: '', action: 'all' });
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchLower = userFilters.search.toLowerCase();
            const nameMatch = user.name.toLowerCase().includes(searchLower);
            const emailMatch = user.email.toLowerCase().includes(searchLower);
            const roleMatch = userFilters.role === 'all' || user.role === userFilters.role;
            return (nameMatch || emailMatch) && roleMatch;
        });
    }, [users, userFilters]);

    const filteredAuditLogs = useMemo(() => {
        return auditLogs.filter(log => {
            const searchLower = auditLogFilters.search.toLowerCase();
            const actorMatch = log.actorName.toLowerCase().includes(searchLower);
            const targetMatch = log.targetName.toLowerCase().includes(searchLower);
            const actionMatch = auditLogFilters.action === 'all' || log.action === auditLogFilters.action;
            return (actorMatch || targetMatch) && actionMatch;
        });
    }, [auditLogs, auditLogFilters]);
    
    const handleSelectUser = (userId: string) => {
        setSelectedUserIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };
    
    const handleSelectAllUsers = () => {
        if (selectedUserIds.size === filteredUsers.length) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleInviteUser = (name: string, email: string, role: UserRole) => {
        addUser({ name, email, role });
        setInviteModalOpen(false);
    };
    
    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to remove ${selectedUserIds.size} users?`)) {
            selectedUserIds.forEach(id => removeUser(id));
            setSelectedUserIds(new Set());
        }
    };
    
    const handleBulkRoleChange = (newRole: UserRole) => {
        selectedUserIds.forEach(id => changeUserRole(id, newRole));
        setSelectedUserIds(new Set());
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.userManagement') as string}</h1>
                {activeTab === 'users' && (
                    <button onClick={() => setInviteModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('userManagement.inviteUser') as string}
                    </button>
                )}
            </div>
            
            {error && <ErrorMessage message={error.message} />}

            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {t('userManagement.users') as string}
                    </button>
                    <button onClick={() => setActiveTab('logs')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'logs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {t('userManagement.auditLogs') as string}
                    </button>
                </nav>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
                {activeTab === 'users' ? (
                    <div className="p-4 space-y-4">
                        <UserFilters filters={userFilters} onFilterChange={setUserFilters} />
                        <BulkActionsToolbar selectedIds={selectedUserIds} onBulkDelete={handleBulkDelete} onBulkRoleChange={handleBulkRoleChange} />
                        {isLoading ? <SkeletonLoader className="h-64 w-full" /> : 
                            <UsersTable 
                                users={filteredUsers}
                                selectedUserIds={selectedUserIds}
                                onSelectUser={handleSelectUser}
                                onSelectAllUsers={handleSelectAllUsers}
                                onRemove={removeUser}
                                onChangeRole={changeUserRole}
                            />
                        }
                    </div>
                ) : (
                     <div className="p-4 space-y-4">
                        <AuditLogFilters filters={auditLogFilters} onFilterChange={setAuditLogFilters} />
                        {isLoading ? <SkeletonLoader className="h-64 w-full" /> : <AuditLogsTable logs={filteredAuditLogs} />}
                    </div>
                )}
            </div>
            
            <InviteUserModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} onInvite={handleInviteUser} />
        </div>
    );
};

export default UserManagement;
