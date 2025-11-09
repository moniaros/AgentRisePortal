import { useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { Campaign, CampaignObjective } from '../types';

// In a real app, this would be an API call
const fetchCampaigns = async (): Promise<Campaign[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // A mock campaign for demonstration
            const mockCampaigns: Campaign[] = [
                {
                    id: 'camp_1',
                    name: 'Summer Auto Insurance Promo',
                    objective: CampaignObjective.LEAD_GENERATION,
                    audience: { ageRange: [25, 55], interests: ['cars', 'driving'] },
                    budget: 500,
                    startDate: '2024-07-01',
                    endDate: '2024-07-31',
                    creative: { headline: 'Save Big on Car Insurance This Summer!', body: 'Get a free quote today and see how much you can save.', image: 'https://via.placeholder.com/1200x628.png?text=Summer+Car+Insurance' },
                    status: 'active',
                },
            ];
            resolve(mockCampaigns);
        }, 500);
    });
};


export const useCampaigns = () => {
    const { 
        data: campaigns, 
        isLoading, 
        error, 
        updateData: setCampaigns 
    } = useOfflineSync<Campaign[]>('campaigns_data', fetchCampaigns, []);

    const addCampaign = useCallback((campaignData: Omit<Campaign, 'id'>) => {
        const newCampaign: Campaign = {
            ...campaignData,
            id: `camp_${Date.now()}`,
        };
        setCampaigns([...campaigns, newCampaign]);
    }, [campaigns, setCampaigns]);

    return { campaigns, isLoading, error, addCampaign };
};
