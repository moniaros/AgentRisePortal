import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchServiceRequests } from '../services/api';
import { ServiceRequest } from '../types';
import { useAuth } from './useAuth';

export const useServiceRequestsData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allServiceRequests,
        isLoading,
        error,
    } = useOfflineSync<ServiceRequest[]>('service_requests_data', fetchServiceRequests, []);

    const serviceRequests = useMemo(() => {
        if (!agencyId) return [];
        return allServiceRequests.filter(sr => sr.agencyId === agencyId);
    }, [allServiceRequests, agencyId]);

    return { serviceRequests, isLoading, error };
};
