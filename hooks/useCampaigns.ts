
import { useState, useCallback } from 'react';
import { Campaign, CampaignObjective } from '../types';

const mockCampaigns: Campaign[] = [
    {
        id: 'camp_1',
        name: 'Summer Auto Insurance Drive',
        objective: CampaignObjective.LEAD_GENERATION,
        status: 'active',
        budget: 5000,
        startDate: new Date('2024-06-01').toISOString(),
        endDate: new Date('2024-08-31').toISOString(),
        audience: { ageRange: [25, 55], interests: ['cars', 'driving', 'car maintenance'] },
        creative: { headline: 'Save Big on Car Insurance This Summer!', body: 'Get a free quote today and see how much you can save.', image: 'https://via.placeholder.com/600x400.png?text=Auto+Insurance' }
    },
    {
        id: 'camp_2',
        name: 'New Homeowner Policy Promo',
        objective: CampaignObjective.BRAND_AWARENESS,
        status: 'completed',
        budget: 10000,
        startDate: new Date('2024-03-01').toISOString(),
        endDate: new Date('2024-05-31').toISOString(),
        audience: { ageRange: [30, 65], interests: ['real estate', 'home improvement', 'mortgage'] },
        creative: { headline: 'Protect Your New Home', body: 'Comprehensive homeowner insurance tailored for you.', image: 'https://via.placeholder.com/600x400.png?text=Home+Insurance' }
    }
];

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addCampaign = useCallback((campaignData: Omit<Campaign, 'id'>) => {
        const newCampaign: Campaign = {
            ...campaignData,
            id: `camp_${Date.now()}`,
        };
        setCampaigns(prev => [...prev, newCampaign]);
    }, []);

    const updateCampaign = useCallback((updatedCampaign: Campaign) => {
        setCampaigns(prev => prev.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
    }, []);

    return { campaigns, isLoading, error, addCampaign, updateCampaign };
};
