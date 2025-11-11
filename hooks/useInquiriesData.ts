import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchInquiries } from '../services/api';
import { TransactionInquiry } from '../types';
import { useAuth } from './useAuth';

export const useInquiriesData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allInquiries,
        isLoading,
        error,
    } = useOfflineSync<TransactionInquiry[]>('inquiries_data', fetchInquiries, []);

    const inquiries = useMemo(() => {
        if (!agencyId) return [];
        return allInquiries.filter(i => i.agencyId === agencyId);
    }, [allInquiries, agencyId]);

    return { inquiries, isLoading, error };
};
