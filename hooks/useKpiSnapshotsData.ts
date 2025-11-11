import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchKpiSnapshots } from '../services/api';
import { KPISnapshot } from '../types';
import { useAuth } from './useAuth';

export const useKpiSnapshotsData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allKpiSnapshots,
        isLoading,
        error,
    } = useOfflineSync<KPISnapshot[]>('kpi_snapshots_data', fetchKpiSnapshots, []);

    const kpiSnapshots = useMemo(() => {
        if (!agencyId) return [];
        return allKpiSnapshots.filter(k => k.agencyId === agencyId);
    }, [allKpiSnapshots, agencyId]);

    return { kpiSnapshots, isLoading, error };
};
