import { useOfflineSync } from './useOfflineSync';
import { fetchAllConversions } from '../services/api';
import { Conversion } from '../types';

export const useAllConversionsData = () => {
    const {
        data: allConversions,
        isLoading,
        error,
    } = useOfflineSync<Conversion[]>('all_conversions_data', fetchAllConversions, []);

    return { allConversions, isLoading, error };
};
