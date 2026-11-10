import { useMemo, useCallback } from 'react';
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
        updateData,
    } = useOfflineSync<ServiceRequest[]>(
        'agentos_db_service_requests',
        fetchServiceRequests,
        []
    );

    const serviceRequests = useMemo(() => {
        if (!agencyId) return allServiceRequests;
        return allServiceRequests.filter((sr) => sr.agencyId === agencyId);
    }, [allServiceRequests, agencyId]);

    const submitServiceRequest = useCallback(
        (req: Omit<ServiceRequest, 'id' | 'createdAt'>): ServiceRequest => {
            const created: ServiceRequest = {
                ...req,
                id: `sr_${Date.now()}`,
                agencyId: req.agencyId || agencyId || 'agency_1',
                createdAt: new Date().toISOString(),
                status: req.status || 'open',
            };
            updateData([created, ...allServiceRequests]);
            return created;
        },
        [agencyId, allServiceRequests, updateData]
    );

    return { serviceRequests, allServiceRequests, isLoading, error, submitServiceRequest };
};