import { useOfflineSync } from './useOfflineSync';
import { fetchAllFunnelRuns } from '../services/api';
import { FunnelRun } from '../types';

export const useAllFunnelRunsData = () => {
    const {
        data: allFunnelRuns,
        isLoading,
        error,
    } = useOfflineSync<FunnelRun[]>('all_funnel_runs_data', fetchAllFunnelRuns, []);

    return { allFunnelRuns, isLoading, error };
};
