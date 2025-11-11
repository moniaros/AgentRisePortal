import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchOpportunities } from '../services/api';
import { Opportunity__EXT } from '../types';
import { useAuth } from './useAuth';

export const useOpportunitiesData = () => {
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
