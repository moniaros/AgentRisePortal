import { useOfflineSync } from './useOfflineSync';
import { fetchAllKpiSnapshots } from '../services/api';
import { KPISnapshot } from '../types';

export const useAllKpiSnapshotsData = () => {
    const {
        data: allKpiSnapshots,
        isLoading,
        error,
    } = useOfflineSync<KPISnapshot[]>('all_kpi_snapshots_data', fetchAllKpiSnapshots, []);

    return { allKpiSnapshots, isLoading, error };
};
