
import React, { useState } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import CampaignList from '../components/campaigns/CampaignList';
import CampaignWizard from '../components/campaigns/CampaignWizard';
import { useLocalization } from '../hooks/useLocalization';
import { Campaign } from '../types';

const AdCampaigns: React.FC = () => {
    const { t } = useLocalization();
    const { campaigns, addCampaign, isLoading, error } = useCampaigns();
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const handleSaveCampaign = (campaign: Omit<Campaign, 'id'>) => {
      addCampaign(campaign);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.adCampaigns')}</h1>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    {t('campaigns.create')}
                </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {isLoading ? (
                <p>{t('common.loading')}</p>
            ) : (
                <CampaignList campaigns={campaigns} onEdit={() => { /* Implement edit logic */ }} />
            )}
            <CampaignWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onSave={handleSaveCampaign}
            />
        </div>
    );
};

export default AdCampaigns;
