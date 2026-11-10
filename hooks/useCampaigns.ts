import { useCallback, useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { Campaign, CampaignObjective, Language } from '../types';
import { useAuth } from './useAuth';
import { getCampaignBannerDataUri } from '../lib/avatars';

const fetchCampaigns = async (): Promise<Campaign[]> => {
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
            creative: {
                headline: 'Save Big on Car Insurance This Summer!',
                body: 'Get a free quote today and see how much you can save.',
                image: getCampaignBannerDataUri('auto'),
            },
            status: 'active',
            agencyId: 'agency_1',
        },
        {
            id: 'camp_2',
            name: 'Προσφορά Ασφάλειας Κατοικίας & ΕΝΦΙΑ -20%',
            objective: CampaignObjective.LEAD_GENERATION,
            network: 'instagram',
            language: Language.EL,
            audience: { ageRange: [30, 65], interests: ['home improvement', 'real estate'] },
            budget: 750,
            startDate: '2024-08-01',
            endDate: '2024-08-31',
            creative: {
                headline: 'Προστατέψτε το Σπίτι σας & Κερδίστε Έκπτωση ΕΝΦΙΑ -20%!',
                body: 'Ασφάλεια κατοικίας με κάλυψη Πυρός, Σεισμού & Πλημμύρας από 6 κορυφαίες ασφαλιστικές.',
                image: getCampaignBannerDataUri('home'),
            },
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
            creative: {
                headline: 'Professional Insurance Solutions',
                body: 'Trust Beta Brokers for all your commercial insurance needs.',
                image: getCampaignBannerDataUri('business'),
            },
            status: 'draft',
            agencyId: 'agency_2',
        },
    ];
    return Promise.resolve(mockCampaigns);
};

const normalizeBanner = (campaign: Campaign): Campaign => {
    const img = campaign.creative?.image || '';
    const hasUnescapedSvgAmp =
        img.startsWith('data:image/svg+xml') && img.includes('%20%26%20');
    if (!img || img.includes('via.placeholder.com') || hasUnescapedSvgAmp) {
        const lower = `${campaign.name} ${campaign.creative?.headline || ''}`.toLowerCase();
        const theme =
            lower.includes('home') || lower.includes('κατοικία')
                ? 'home'
                : lower.includes('health') || lower.includes('υγεία')
                ? 'health'
                : lower.includes('business') || lower.includes('commercial')
                ? 'business'
                : 'auto';
        return {
            ...campaign,
            creative: {
                ...campaign.creative,
                image: getCampaignBannerDataUri(theme),
            },
        };
    }
    return campaign;
};

export const useCampaigns = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: rawCampaigns,
        isLoading,
        error,
        updateData: setAllCampaigns,
    } = useOfflineSync<Campaign[]>('campaigns_data', fetchCampaigns, []);

    const allCampaigns = useMemo(() => rawCampaigns.map(normalizeBanner), [rawCampaigns]);

    const campaigns = useMemo(
        () => (agencyId ? allCampaigns.filter((c) => c.agencyId === agencyId) : allCampaigns),
        [allCampaigns, agencyId]
    );

    const addCampaign = useCallback(
        (campaignData: Omit<Campaign, 'id' | 'agencyId'>) => {
            if (!agencyId) return;
            const newCampaign: Campaign = normalizeBanner({
                ...campaignData,
                id: `camp_${Date.now()}`,
                agencyId,
            });
            setAllCampaigns([...allCampaigns, newCampaign]);
        },
        [allCampaigns, setAllCampaigns, agencyId]
    );

    return { campaigns, allCampaigns, isLoading, error, addCampaign };
};