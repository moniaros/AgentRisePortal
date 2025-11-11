import { useOfflineSync } from './useOfflineSync';
import { fetchAllLeads } from '../services/api';
import { Lead } from '../types';

export const useAllLeadsData = () => {
    const {
        data: allLeads,
        isLoading,
        error,
    } = useOfflineSync<Lead[]>('all_leads_data', fetchAllLeads, []);

    return { allLeads, isLoading, error };
};
