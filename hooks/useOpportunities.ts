import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchOpportunities } from '../services/api';
import { Opportunity__EXT } from '../types';
import { useAuth } from './useAuth';

// This is a simplified hook. In a real app, it might be more complex
// or be part of a larger CRM data hook.
export const useOpportunities = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allOpportunities,
        isLoading,
        error,
    } = useOfflineSync<Opportunity__EXT[]>('opportunities_data', fetchOpportunities, []);

    const opportunities = useMemo(() => {
        if (!agencyId) return [];
        return allOpportunities.filter(opp => opp.agencyId === agencyId);
    }, [allOpportunities, agencyId]);

    return { opportunities, isLoading, error };
};
