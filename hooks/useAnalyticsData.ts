import { useState, useEffect } from 'react';

// Mock data structure
interface AnalyticsData {
    totalLeads: number;
    conversionRate: number;
    totalSpend: number;
    performance: { date: string; leads: number }[];
}

export const useAnalyticsData = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Simulate API call
                await new Promise(res => setTimeout(res, 1000));
                setData({
                    totalLeads: 125,
                    conversionRate: 12.5,
                    totalSpend: 2500,
                    performance: [
                        { date: '2024-07-01', leads: 5 },
                        { date: '2024-07-02', leads: 8 },
                        { date: '2024-07-03', leads: 6 },
                    ]
                });
            } catch (err) {
                setError('Failed to fetch analytics data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return { data, isLoading, error };
};
