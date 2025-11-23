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
             <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
        )
    }

    if (!campaign) {
         return (
             <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-12 text-center border border-slate-200">
                    <div className="text-6xl mb-6">⚠️</div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-4">{t('leadCapture.invalidCampaign')}</h1>
                    <p className="text-slate-500 text-lg">This offer may have expired or the link is incorrect. Please contact us directly for assistance.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
             <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white shadow-2xl rounded-3xl p-12 text-center animate-fade-in border border-white/50 backdrop-blur-lg">
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{t('leadCapture.thankYouTitle')}</h1>
                    <p className="text-slate-600 text-lg leading-relaxed">{t('leadCapture.thankYouMessage')}</p>
                </div>
            </div>
        );
    }
    
    const { creative, leadCaptureForm } = campaign;
    
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            {/* Header / Trust Bar */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="font-bold text-2xl text-blue-700 flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1 rounded">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span>AgentOS</span>
                    </div>
                    <div className="text-slate-500 text-sm font-medium hidden sm:block">
                        Authorized Insurance Partner
                    </div>
                </div>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    
                    {/* Left Column: The Hook / Value Prop */}
                    <div className="flex flex-col justify-center space-y-8 order-2 lg:order-1">
                        {themeContent && (
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs uppercase tracking-wider w-fit border border-blue-200">
                                {themeContent.badge}
                            </span>
                        )}
                        
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
                            {creative.headline || (themeContent ? themeContent.title : t('leadCapture.title'))}
                        </h1>
                        
                        <p className="text-xl text-slate-600 leading-relaxed">
                            {creative.body || (themeContent ? themeContent.subtitle : t('leadCapture.subtitle'))}
                        </p>

                        {themeContent && (
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-slate-700 font-medium text-lg">
                                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm shadow-sm">✓</div>
                                    {themeContent.benefit1}
                                </li>
                                <li className="flex items-start gap-3 text-slate-700 font-medium text-lg">
                                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm shadow-sm">✓</div>
                                    {themeContent.benefit2}
                                </li>
                                <li className="flex items-start gap-3 text-slate-700 font-medium text-lg">
                                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm shadow-sm">✓</div>
                                    {themeContent.benefit3}
                                </li>
                            </ul>
                        )}

                        <div className="flex items-center gap-6 pt-6 border-t border-slate-200">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <img key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 shadow-sm" src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="User" />
                                ))}
                            </div>
                            <div>
                                <div className="flex text-yellow-400 text-lg mb-0.5">★★★★★</div>
                                <p className="text-sm font-bold text-slate-600">
                                    Trusted by 500+ families
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: The Capture Form */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100 relative">
                            {creative.image && (
                                <div className="relative h-48 w-full overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                    <img src={creative.image} alt="Campaign Visual" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute bottom-4 left-4 z-20 text-white">
                                        <p className="font-bold text-lg">Limited Time Offer</p>
                                        <p className="text-sm opacity-90">Get your quote today</p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="p-8 md:p-10">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                                    {language === 'el' ? 'Συμπληρώστε τη φόρμα' : 'Get Your Free Quote'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {leadCaptureForm?.fields.map(field => (
                                        <div key={field.name}>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">{t(`leadCapture.form.${field.name}` as any) || field.name}</label>
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                required={field.required}
                                                placeholder={t(`leadCapture.form.${field.name}` as any) || field.name}
                                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        className="w-full py-4 px-6 mt-2 rounded-xl shadow-lg shadow-blue-600/30 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/20 transform transition hover:-translate-y-1 active:translate-y-0"
                                    >
                                        {t('leadCapture.submitButton')}
                                    </button>
                                </form>
                                
                                <p className="text-center text-xs text-slate-400 mt-6">
                                    Your information is secure. By clicking, you agree to our Terms & Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LeadCapturePage;