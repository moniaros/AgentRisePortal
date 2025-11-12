import { useState, useEffect, useCallback } from 'react';
import { getAllVerifiedOpportunitiesForAgency } from '../services/findingsStorage';
import { useAuth } from './useAuth';

export const useAllVerifiedOpportunities = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const [upsellCount, setUpsellCount] = useState(0);
    const [crossSellCount, setCrossSellCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const loadCounts = useCallback(() => {
        if (!agencyId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        // Simulate async
        setTimeout(() => {
            const counts = getAllVerifiedOpportunitiesForAgency(agencyId);
            setUpsellCount(counts.upsell);
            setCrossSellCount(counts.crossSell);
            setIsLoading(false);
        }, 200);
    }, [agencyId]);

    useEffect(() => {
        loadCounts();
    }, [loadCounts]);

    return {
        upsellCount,
        crossSellCount,
        isLoading,
        refresh: loadCounts,
    };
};