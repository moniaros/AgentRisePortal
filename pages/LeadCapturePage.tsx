
import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import { Campaign, Lead, LeadStatus, PolicyType } from '../types';

const LeadCapturePage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const { campaigns, isLoading: campaignsLoading } = useCampaigns();
    const { addLead } = useCrmData();
    const { t, language } = useLocalization();

    const [submitted, setSubmitted] = useState(false);
    
    const campaign = useMemo(() => {
        if (!campaignId || campaignsLoading) return null;
        return campaigns.find(c => c.id === campaignId);
    }, [campaignId, campaigns, campaignsLoading]);

    // Determine campaign type/theme based on name or creative content for dynamic styling
    const campaignTheme = useMemo(() => {
        if (!campaign) return 'generic';
        const text = (campaign.name + campaign.creative.headline).toLowerCase();
        if (text.includes('home') || text.includes('enfia') || text.includes('κατοικία')) return 'home';
        if (text.includes('health') || text.includes('υγεία')) return 'health';
        if (text.includes('auto') || text.includes('car') || text.includes('αυτοκίνητο')) return 'auto';
        return 'generic';
    }, [campaign]);

    const themeContent = useMemo(() => {
        if (campaignTheme === 'generic') return null;
        // @ts-ignore
        return t(`leadCapture.magnets.${campaignTheme}`);
    }, [campaignTheme, t]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!campaign) return;

        const formData = new FormData(e.currentTarget);
        const fullName = formData.get('name') as string || '';
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ');

        const newLead: Omit<Lead, 'id' | 'createdAt' | 'agencyId'> = {
            firstName,
            lastName: lastName || '',
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            source: campaign.name,
            campaignId: campaign.id,
            status: LeadStatus.NEW,
            policyType: campaignTheme === 'home' ? PolicyType.HOME : campaignTheme === 'health' ? PolicyType.HEALTH : PolicyType.AUTO,
            potentialValue: 0,
        };

        addLead(newLead);
        setSubmitted(true);
    };
    
    if (campaignsLoading) {
        return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!campaign) {
         return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center border border-red-100">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('leadCapture.invalidCampaign')}</h1>
                    <p className="text-gray-500">This offer may have expired. Please contact us directly.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('leadCapture.thankYouTitle')}</h1>
                    <p className="text-gray-600">{t('leadCapture.thankYouMessage')}</p>
                </div>
            </div>
        );
    }
    
    const { creative, leadCaptureForm } = campaign;
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col">
            {/* Header / Trust Bar */}
            <div className="bg-white shadow-sm p-4 flex justify-center items-center gap-2 border-b border-gray-200">
                <div className="font-bold text-xl text-blue-800 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>AgentOS</span>
                </div>
                <span className="text-gray-400 text-sm">| Authorized Insurance Partners</span>
            </div>

            <div className="flex-grow flex items-center justify-center p-4 md:p-8">
                <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-stretch">
                    
                    {/* Left Column: The Hook / Value Prop */}
                    <div className="flex flex-col justify-center space-y-6">
                        {themeContent && (
                            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-sm w-fit">
                                {themeContent.badge}
                            </span>
                        )}
                        
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                            {creative.headline || (themeContent ? themeContent.title : t('leadCapture.title'))}
                        </h1>
                        
                        <p className="text-lg text-gray-600 leading-relaxed">
                            {creative.body || (themeContent ? themeContent.subtitle : t('leadCapture.subtitle'))}
                        </p>

                        {themeContent && (
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <span className="text-green-500 text-xl">✔</span> {themeContent.benefit1}
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <span className="text-green-500 text-xl">✔</span> {themeContent.benefit2}
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 font-medium">
                                    <span className="text-green-500 text-xl">✔</span> {themeContent.benefit3}
                                </li>
                            </ul>
                        )}

                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex -space-x-2">
                                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=1" alt="User" />
                                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=2" alt="User" />
                                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/150?u=3" alt="User" />
                            </div>
                            <p className="text-sm text-gray-500">
                                Trusted by <strong>500+</strong> families this month.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: The Capture Form */}
                    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 flex flex-col">
                        {creative.image && <img src={creative.image} alt="Campaign Visual" className="w-full h-48 object-cover" />}
                        <div className="p-8 flex-grow flex flex-col justify-center">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                                {language === 'el' ? 'Συμπληρώστε τη φόρμα για δωρεάν προσφορά' : 'Fill the form for a free quote'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {leadCaptureForm?.fields.map(field => (
                                    <div key={field.name}>
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            required={field.required}
                                            placeholder={t(`leadCapture.form.${field.name}` as any) || field.name}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="submit"
                                    className="w-full py-4 px-6 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition hover:-translate-y-0.5"
                                >
                                    {t('leadCapture.submitButton')} &rarr;
                                </button>
                            </form>
                            
                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-400 mb-2">Or verify instantly via:</p>
                                <div className="flex justify-center gap-4">
                                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-green-600 font-bold flex items-center gap-2 px-4">
                                        <span>💬</span> WhatsApp
                                    </button>
                                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-blue-600 font-bold flex items-center gap-2 px-4">
                                        <span>📞</span> Call Us
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LeadCapturePage;
