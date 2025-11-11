import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchInteractions } from '../services/api';
import { Interaction } from '../types';
import { useAuth } from './useAuth';

export const useInteractionsData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allInteractions,
        isLoading,
        error,
    } = useOfflineSync<Interaction[]>('interactions_data', fetchInteractions, []);

    const interactions = useMemo(() => {
        if (!agencyId) return [];
        return allInteractions.filter(i => i.agencyId === agencyId);
    }, [allInteractions, agencyId]);

    return { interactions, isLoading, error };
};
