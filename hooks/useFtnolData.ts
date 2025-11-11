import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchFirstNoticeOfLoss } from '../services/api';
import { FirstNoticeOfLoss } from '../types';
import { useAuth } from './useAuth';

export const useFtnolData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allFtnol,
        isLoading,
        error,
    } = useOfflineSync<FirstNoticeOfLoss[]>('ftnol_data', fetchFirstNoticeOfLoss, []);

    const ftnol = useMemo(() => {
        if (!agencyId) return [];
        return allFtnol.filter(f => f.agencyId === agencyId);
    }, [allFtnol, agencyId]);

    return { ftnol, isLoading, error };
};