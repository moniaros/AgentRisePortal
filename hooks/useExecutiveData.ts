
import { useOfflineSync } from './useOfflineSync';
// FIX: Import from services/api
import { fetchExecutiveData } from '../services/api';
// FIX: Import from types
import { ExecutiveData } from '../types';

const initialData: ExecutiveData = {
    agencyGrowth: [],
    productMix: [],
    claimsTrend: [],
    leadFunnel: [],
    campaignRoi: [],
    riskExposure: [],
};

export const useExecutiveData = () => {
    return useOfflineSync<ExecutiveData>('executive_data', fetchExecutiveData, initialData);
};
