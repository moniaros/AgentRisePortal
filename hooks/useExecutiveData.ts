import { useOfflineSync } from './useOfflineSync';
import { fetchExecutiveData } from '../services/api';
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
