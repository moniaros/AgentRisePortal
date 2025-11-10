import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import { Campaign, Lead, PolicyType } from '../types';


const LeadCapturePage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const { campaigns, isLoading: campaignsLoading } = useCampaigns();
    const { addLead } = useCrmData();
    const { t } = useLocalization();

    const [submitted, setSubmitted] = useState(false);
    
    const campaign = useMemo(() => {
        if (!campaignId || campaignsLoading) return null;
        return campaigns.find(c => c.id === campaignId);
    }, [campaignId, campaigns, campaignsLoading]);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!campaign) return;

        const formData = new FormData(e.currentTarget);
        const fullName = formData.get('name') as string || '';
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        const newLead: Omit<Lead, 'id' | 'createdAt'> = {
            firstName,
            lastName: lastName || '', // Handle cases with only a first name
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            source: campaign.name,
            campaignId: campaign.id,
            status: 'new',
            policyType: PolicyType.AUTO, // Default policy type for new leads
            potentialValue: 0,
        };

        addLead(newLead);
        setSubmitted(true);
    };
    
    if (campaignsLoading) {
        return (
             <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!campaign) {
         return (
             <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">{t('leadCapture.invalidCampaign')}</h1>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
             <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
                    <h1 className="text-2xl font-bold text-green-600 mb-4">{t('leadCapture.thankYouTitle')}</h1>
                    <p className="text-gray-600">{t('leadCapture.thankYouMessage')}</p>
                </div>
            </div>
        );
    }
    
    const { creative, leadCaptureForm } = campaign;
    
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden">
                {creative.image && <img src={creative.image} alt={campaign.name} className="w-full h-48 object-cover" />}
                <div className="p-8">
                    <h1 className="text-2xl font-bold mb-2">{creative.headline || t('leadCapture.title')}</h1>
                    <p className="text-gray-600 mb-6">{creative.body || t('leadCapture.subtitle')}</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {leadCaptureForm?.fields.map(field => (
                            <div key={field.name}>
                                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 capitalize">
                                    {t(`leadCapture.form.${field.name}` as any) || field.name}
                                    {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type={field.type}
                                    id={field.name}
                                    name={field.name}
                                    required={field.required}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        ))}
                         <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {t('leadCapture.submitButton')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LeadCapturePage;