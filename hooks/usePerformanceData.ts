import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchPerformanceSamples } from '../services/api';
import { PerfSample } from '../types';
import { useAuth } from './useAuth';

export const usePerformanceData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allPerformanceSamples,
        isLoading,
        error,
    } = useOfflineSync<PerfSample[]>('performance_samples_data', fetchPerformanceSamples, []);

    const performanceSamples = useMemo(() => {
        if (!agencyId) return [];
        return allPerformanceSamples.filter(s => s.agencyId === agencyId);
    }, [allPerformanceSamples, agencyId]);

    return { performanceSamples, isLoading, error };
};
