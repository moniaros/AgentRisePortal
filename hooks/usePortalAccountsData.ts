import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchPortalAccounts } from '../services/api';
import { PortalAccount__EXT } from '../types';
import { useAuth } from './useAuth';

export const usePortalAccountsData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allPortalAccounts,
        isLoading,
        error,
    } = useOfflineSync<PortalAccount__EXT[]>('portal_accounts_data', fetchPortalAccounts, []);

    const portalAccounts = useMemo(() => {
        if (!agencyId) return [];
        return allPortalAccounts.filter(pa => pa.agencyId === agencyId);
    }, [allPortalAccounts, agencyId]);

    return { portalAccounts, isLoading, error };
};
