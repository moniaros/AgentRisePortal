import { useMemo, useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchUsers, fetchAuditLogs } from '../services/api';
// FIX: Module '"../types"' has no exported member 'UserRole'. Use 'UserSystemRole' instead.
import { User, AuditLog, UserSystemRole } from '../types';
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
            // FIX: Property 'name' does not exist on type 'User'. Use party.partyName properties instead.
            actorName: `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`,
            action,
            targetName,
            details,
            agencyId,
        };
        setAllAuditLogs([...allAuditLogs, newLog]);
    }, [allAuditLogs, setAllAuditLogs, agencyId, currentUser]);
    
    const addUser = useCallback((userData: { name: string; email: string; role: UserSystemRole }) => {
        if (!agencyId) return;
        // FIX: The created User object must match the nested structure defined in 'types.ts'.
        const [firstName, ...lastNameParts] = userData.name.split(' ');
        const lastName = lastNameParts.join(' ');
        const newUser: User = {
            id: `user_${Date.now()}`,
            agencyId: agencyId,
            party: {
                partyName: {
                    firstName: firstName || '',
                    lastName: lastName || '',
                },
                contactInfo: {
                    email: userData.email,
                },
            },
            partyRole: {
                roleType: userData.role,
                roleTitle: userData.role === UserSystemRole.ADMIN ? 'Administrator' : 'Agent',
                permissionsScope: 'agency',
            },
        };
        setAllUsers([...allUsers, newUser]);
        logAuditEvent('user_invited', userData.email, `Invited with role: ${userData.role}`);
    }, [allUsers, setAllUsers, agencyId, logAuditEvent]);
    
    const removeUser = useCallback((userId: string) => {
        const userToRemove = allUsers.find(u => u.id === userId);
        if (userToRemove) {
            setAllUsers(allUsers.filter(u => u.id !== userId));
            // FIX: Properties 'name' and 'email' do not exist on type 'User'. Use nested properties instead.
            logAuditEvent('user_removed', `${userToRemove.party.partyName.firstName} ${userToRemove.party.partyName.lastName}`, `User ${userToRemove.party.contactInfo.email} removed.`);
        }
    }, [allUsers, setAllUsers, logAuditEvent]);

    const changeUserRole = useCallback((userId: string, newRole: UserSystemRole) => {
        const userToUpdate = allUsers.find(u => u.id === userId);
        if (userToUpdate) {
            // FIX: Property 'role' does not exist on type 'User'. Use partyRole.roleType instead.
            const oldRole = userToUpdate.partyRole.roleType;
            setAllUsers(allUsers.map(u => u.id === userId ? { ...u, partyRole: { ...u.partyRole, roleType: newRole } } : u));
            // FIX: Property 'name' does not exist on type 'User'. Use party.partyName properties instead.
            logAuditEvent('role_changed', `${userToUpdate.party.partyName.firstName} ${userToUpdate.party.partyName.lastName}`, `Role changed from ${oldRole} to ${newRole}.`);
        }
    }, [allUsers, setAllUsers, logAuditEvent]);


    return { users, auditLogs, isLoading, error, addUser, removeUser, changeUserRole };
};
