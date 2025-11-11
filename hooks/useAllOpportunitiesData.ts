import { useOfflineSync } from './useOfflineSync';
import { fetchAllOpportunities } from '../services/api';
import { Opportunity__EXT } from '../types';

export const useAllOpportunitiesData = () => {
    const {
        data: allOpportunities,
        isLoading,
        error,
    } = useOfflineSync<Opportunity__EXT[]>('all_opportunities_data', fetchAllOpportunities, []);

    return { allOpportunities, isLoading, error };
};
