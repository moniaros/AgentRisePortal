
import { useOfflineSync } from './useOfflineSync';
// FIX: Import from services/api
import { fetchAnalyticsData } from '../services/api';
// FIX: Import from types
import { AnalyticsData } from '../types';

export const useAnalyticsData = () => {
    return useOfflineSync<AnalyticsData>('analytics_data', fetchAnalyticsData, []);
};
