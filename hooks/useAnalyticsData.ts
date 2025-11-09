import { useOfflineSync } from './useOfflineSync';
import { fetchAnalyticsData } from '../services/api';
import { AnalyticsData } from '../types';

export const useAnalyticsData = () => {
    return useOfflineSync<AnalyticsData>('analytics_data', fetchAnalyticsData, []);
};