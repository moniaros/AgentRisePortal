
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
        // Simulate async loading
        setTimeout(() => {
            const storedData = getAnalysesForCustomer(customerId);
            
            // Inject mock data based on customer ID
            let combinedData = [...storedData];
            const existingIds = new Set(storedData.map(a => a.id));
            
            // Filter mocks relevant to this customer
            const relevantMocks = MOCK_ANALYSES.filter(m => {
                // Simple name matching logic for the mock data
                if (customerId === 'cust_1' || customerId === 'cust1') {
                    return m.parsedPolicy.policyholder.name.includes('Alexandros') || m.parsedPolicy.policyholder.name.includes('Αλέξανδρος');
                }
                if (customerId === 'cust_2' || customerId === 'cust2') {
                    return m.parsedPolicy.policyholder.name.includes('Jane');
                }
                return false;
            });

            const newMocks = relevantMocks.filter(m => !existingIds.has(m.id));
            combinedData = [...combinedData, ...newMocks];

            setAnalyses(combinedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setIsLoading(false);
        }, 300); 
    }, [customerId]);

    useEffect(() => {
        loadAnalyses();
    }, [loadAnalyses]);

    return { analyses, isLoading, refreshAnalyses: loadAnalyses };
};
