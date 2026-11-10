import { useMemo, useCallback } from 'react';
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
        updateData,
    } = useOfflineSync<FirstNoticeOfLoss[]>(
        'agentos_db_ftnol',
        fetchFirstNoticeOfLoss,
        []
    );

    const ftnol = useMemo(() => {
        if (!agencyId) return allFtnol;
        return allFtnol.filter((f) => f.agencyId === agencyId);
    }, [allFtnol, agencyId]);

    const submitFtnol = useCallback(
        (claim: Omit<FirstNoticeOfLoss, 'id' | 'createdAt'>): FirstNoticeOfLoss => {
            const newClaim: FirstNoticeOfLoss = {
                ...claim,
                id: `fnol_${Date.now()}`,
                agencyId: claim.agencyId || agencyId || 'agency_1',
                createdAt: new Date().toISOString(),
                status: claim.status || 'submitted',
            };
            updateData([newClaim, ...allFtnol]);
            return newClaim;
        },
        [agencyId, allFtnol, updateData]
    );

    return { ftnol, allFtnol, isLoading, error, submitFtnol };
};