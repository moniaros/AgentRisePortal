import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useUserManagementData } from '../hooks/useUserManagementData';
import UsersTable from '../components/users/UsersTable';
import AuditLogsTable from '../components/users/AuditLogsTable';
import InviteUserModal from '../components/users/InviteUserModal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import { User, UserRole } from '../types';

const UserManagement: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { users, auditLogs, isLoading, error, addUser, removeUser, changeUserRole } = useUserManagementData();
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

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
                    {isLoading ? <SkeletonLoader className="h-48 w-full" /> : (
                        <UsersTable users={users} onRemove={removeUser} onChangeRole={changeUserRole} />
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">{t('userManagement.auditLog')}</h2>
                    {isLoading ? <SkeletonLoader className="h-48 w-full" /> : (
                        <AuditLogsTable logs={auditLogs} />
                    )}
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
