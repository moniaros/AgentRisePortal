import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useUserManagementData } from '../hooks/useUserManagementData';
import UsersTable from '../components/users/UsersTable';
import AuditLogsTable from '../components/users/AuditLogsTable';
import InviteUserModal from '../components/users/InviteUserModal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import { User, UserRole } from '../types';
import UserFilters from '../components/users/UserFilters';
import AuditLogFilters from '../components/users/AuditLogFilters';
import BulkActionsToolbar from '../components/users/BulkActionsToolbar';

const UserManagement: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { users, auditLogs, isLoading, error, addUser, removeUser, changeUserRole } = useUserManagementData();
    
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [userFilters, setUserFilters] = useState({ search: '', role: 'all' as 'all' | UserRole });
    const [auditFilters, setAuditFilters] = useState({ search: '', action: 'all' });

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
            const searchLower = auditFilters.search.toLowerCase();
            const actorMatch = log.actorName.toLowerCase().includes(searchLower);
            const targetMatch = log.targetName.toLowerCase().includes(searchLower);
            const detailsMatch = log.details.toLowerCase().includes(searchLower);
            const actionMatch = auditFilters.action === 'all' || log.action === auditFilters.action;
            return (actorMatch || targetMatch || detailsMatch) && actionMatch;
        });
    }, [auditLogs, auditFilters]);

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
    
    const handleBulkDelete = () => {
        const userCount = selectedUserIds.size;
        if (userCount > 0 && window.confirm(t('userManagement.bulkActions.confirmBulkDelete').replace('{count}', String(userCount)))) {
            selectedUserIds.forEach(id => {
                if (id !== currentUser?.id) removeUser(id);
            });
            setSelectedUserIds(new Set());
        }
    };
    
    const handleBulkRoleChange = (newRole: UserRole) => {
        selectedUserIds.forEach(id => {
            if (id !== currentUser?.id) changeUserRole(id, newRole);
        });
        setSelectedUserIds(new Set());
    };

    if (currentUser?.role !== 'admin') {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-red-600 mb-2">{t('userManagement.accessDenied')}</h2>
                <p className="text-gray-600 dark:text-gray-400">{t('userManagement.accessDeniedMessage')}</p>
            </div>
        );
    }
    
    const handleInviteUser = (name: string, email: string, role: UserRole) => {
        addUser({ name, email, role });
        setInviteModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('userManagement.title')}</h1>
                <button
                    onClick={() => setInviteModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    {t('userManagement.inviteUser')}
                </button>
            </div>

            {error && <ErrorMessage message={error.message} />}

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">{t('userManagement.users')}</h2>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
                        <UserFilters filters={userFilters} onFilterChange={setUserFilters} />
                        <BulkActionsToolbar 
                            selectedIds={selectedUserIds}
                            onBulkDelete={handleBulkDelete}
                            onBulkRoleChange={handleBulkRoleChange}
                        />
                        {isLoading ? <SkeletonLoader className="h-48 w-full" /> : (
                            <UsersTable 
                                users={filteredUsers} 
                                selectedUserIds={selectedUserIds}
                                onSelectUser={handleSelectUser}
                                onSelectAllUsers={handleSelectAllUsers}
                                onRemove={removeUser} 
                                onChangeRole={changeUserRole} 
                            />
                        )}
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">{t('userManagement.auditLog')}</h2>
                     <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
                        <AuditLogFilters filters={auditFilters} onFilterChange={setAuditFilters} />
                        {isLoading ? <SkeletonLoader className="h-48 w-full" /> : (
                            <AuditLogsTable logs={filteredAuditLogs} />
                        )}
                     </div>
                </div>
            </div>
            
            <InviteUserModal 
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInvite={handleInviteUser}
            />
        </div>
    );
};

export default UserManagement;