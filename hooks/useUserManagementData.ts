import { useMemo, useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchUsers, fetchAuditLogs } from '../services/api';
import { User, AuditLog, UserRole } from '../types';
import { useAuth } from './useAuth';

export const useUserManagementData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allUsers,
        isLoading: usersLoading,
        error: usersError,
        updateData: setAllUsers,
    } = useOfflineSync<User[]>('users_data', fetchUsers, []);

    const {
        data: allAuditLogs,
        isLoading: auditLogsLoading,
        error: auditLogsError,
        updateData: setAllAuditLogs,
    } = useOfflineSync<AuditLog[]>('audit_logs_data', fetchAuditLogs, []);

    const users = useMemo(() => allUsers.filter(u => u.agencyId === agencyId), [allUsers, agencyId]);
    const auditLogs = useMemo(() => allAuditLogs.filter(log => log.agencyId === agencyId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [allAuditLogs, agencyId]);

    const isLoading = usersLoading || auditLogsLoading;
    const error = usersError || auditLogsError;

    const logAuditEvent = useCallback((action: AuditLog['action'], targetName: string, details: string) => {
        if (!agencyId || !currentUser) return;
        const newLog: AuditLog = {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorName: currentUser.name,
            action,
            targetName,
            details,
            agencyId,
        };
        setAllAuditLogs([...allAuditLogs, newLog]);
    }, [allAuditLogs, setAllAuditLogs, agencyId, currentUser]);
    
    const addUser = useCallback((userData: { name: string; email: string; role: UserRole }) => {
        if (!agencyId) return;
        const newUser: User = {
            ...userData,
            id: `user_${Date.now()}`,
            agencyId: agencyId,
        };
        setAllUsers([...allUsers, newUser]);
        logAuditEvent('user_invited', userData.email, `Invited with role: ${userData.role}`);
    }, [allUsers, setAllUsers, agencyId, logAuditEvent]);
    
    const removeUser = useCallback((userId: string) => {
        const userToRemove = allUsers.find(u => u.id === userId);
        if (userToRemove) {
            setAllUsers(allUsers.filter(u => u.id !== userId));
            logAuditEvent('user_removed', userToRemove.name, `User ${userToRemove.email} removed.`);
        }
    }, [allUsers, setAllUsers, logAuditEvent]);

    const changeUserRole = useCallback((userId: string, newRole: UserRole) => {
        const userToUpdate = allUsers.find(u => u.id === userId);
        if (userToUpdate) {
            const oldRole = userToUpdate.role;
            setAllUsers(allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
            logAuditEvent('role_changed', userToUpdate.name, `Role changed from ${oldRole} to ${newRole}.`);
        }
    }, [allUsers, setAllUsers, logAuditEvent]);


    return { users, auditLogs, isLoading, error, addUser, removeUser, changeUserRole };
};
