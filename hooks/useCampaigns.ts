import { useCallback, useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { Campaign, CampaignObjective, Language } from '../types';
import { useAuth } from './useAuth';

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
                    network: 'facebook',
                    language: Language.EN,
                    audience: { ageRange: [25, 55], interests: ['cars', 'driving'] },
                    budget: 500,
                    startDate: '2024-07-01',
                    endDate: '2024-07-31',
                    creative: { headline: 'Save Big on Car Insurance This Summer!', body: 'Get a free quote today and see how much you can save.', image: 'https://via.placeholder.com/1200x628.png?text=Summer+Car+Insurance' },
                    status: 'active',
                    agencyId: 'agency_1',
                },
                {
                    id: 'camp_2',
                    name: 'Προσφορά Ασφάλειας Κατοικίας',
                    objective: CampaignObjective.BRAND_AWARENESS,
                    network: 'instagram',
                    language: Language.EL,
                    audience: { ageRange: [30, 65], interests: ['home improvement', 'real estate'] },
                    budget: 750,
                    startDate: '2024-08-01',
                    endDate: '2024-08-31',
                    creative: { headline: 'Προστατέψτε το Σπίτι σας!', body: 'Ασφάλεια κατοικίας με κορυφαίες καλύψεις. Ζητήστε προσφορά.', image: 'https://via.placeholder.com/1080x1080.png?text=Home+Insurance' },
                    status: 'active',
                    agencyId: 'agency_1',
                },
                {
                    id: 'camp_3',
                    name: 'Beta Brokers Brand Campaign',
                    objective: CampaignObjective.BRAND_AWARENESS,
                    network: 'linkedin',
                    language: Language.EN,
                    audience: { ageRange: [35, 60], interests: ['business', 'finance'] },
                    budget: 1200,
                    startDate: '2024-09-01',
                    endDate: '2024-09-30',
                    creative: { headline: 'Professional Insurance Solutions', body: 'Trust Beta Brokers for all your commercial insurance needs.', image: '' },
                    status: 'draft',
                    agencyId: 'agency_2'
                }
            ];
            resolve(mockCampaigns);
        }, 500);
    });
};


export const useCampaigns = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const { 
        data: allCampaigns, 
        isLoading, 
        error, 
        updateData: setAllCampaigns 
    } = useOfflineSync<Campaign[]>('campaigns_data', fetchCampaigns, []);
    
    const campaigns = useMemo(() => allCampaigns.filter(c => c.agencyId === agencyId), [allCampaigns, agencyId]);

    const addCampaign = useCallback((campaignData: Omit<Campaign, 'id' | 'agencyId'>) => {
        if (!agencyId) return;
        const newCampaign: Campaign = {
            ...campaignData,
            id: `camp_${Date.now()}`,
            agencyId: agencyId,
        };
        setAllCampaigns([...allCampaigns, newCampaign]);
    }, [allCampaigns, setAllCampaigns, agencyId]);

    return { campaigns, isLoading, error, addCampaign };
};
