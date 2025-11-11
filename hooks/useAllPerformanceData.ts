import { useOfflineSync } from './useOfflineSync';
import { fetchAllPerformanceSamples } from '../services/api';
import { PerfSample } from '../types';

export const useAllPerformanceData = () => {
    const {
        data: allPerformanceSamples,
        isLoading,
        error,
    } = useOfflineSync<PerfSample[]>('all_performance_samples_data', fetchAllPerformanceSamples, []);

    return { allPerformanceSamples, isLoading, error };
};
