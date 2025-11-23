import { useState, useCallback, useEffect } from 'react';
import { StoredAnalysis } from '../types';
import { getAnalysesForCustomer } from '../services/analysisStorage';
import { MOCK_ANALYSES } from '../data/mockData';

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
            const storedData = getAnalysesForCustomer(customerId);
            
            // Inject mock data for the demo customer 'cust1'
            let combinedData = [...storedData];
            if (customerId === 'cust1') {
                // Avoid duplicates if already saved (simple check by ID)
                const existingIds = new Set(storedData.map(a => a.id));
                const newMocks = MOCK_ANALYSES.filter(m => !existingIds.has(m.id));
                combinedData = [...combinedData, ...newMocks];
            }

            setAnalyses(combinedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setIsLoading(false);
        }, 300); // Short delay to mimic loading
    }, [customerId]);

    useEffect(() => {
        loadAnalyses();
    }, [loadAnalyses]);

    return { analyses, isLoading, refreshAnalyses: loadAnalyses };
};
