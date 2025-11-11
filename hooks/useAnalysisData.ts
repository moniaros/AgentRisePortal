import { useState, useCallback, useEffect } from 'react';
import { StoredAnalysis } from '../types';
import { getAnalysesForCustomer } from '../services/analysisStorage';

export const useAnalysisData = (customerId: string | undefined) => {
    const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAnalyses = useCallback(() => {
        if (!customerId) {
            setAnalyses([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        // Simulate async loading in case this becomes a real API call later
        setTimeout(() => {
            const data = getAnalysesForCustomer(customerId);
            setAnalyses(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setIsLoading(false);
        }, 300); // Short delay to mimic loading
    }, [customerId]);

    useEffect(() => {
        loadAnalyses();
    }, [loadAnalyses]);

    return { analyses, isLoading, refreshAnalyses: loadAnalyses };
};
