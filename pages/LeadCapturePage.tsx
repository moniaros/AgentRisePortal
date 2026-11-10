import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import { LeadStatus, PolicyType } from '../types';
import { getAvatarDataUri } from '../lib/avatars';
import { getQuickQuoteRange } from '../lib/comparativeRater';

const SOCIAL_PROOF_AVATARS = [
    getAvatarDataUri('Maria Papadopoulou', '#2563eb'),
    getAvatarDataUri('Nikos Georgiou', '#0f766e'),
    getAvatarDataUri('Eleni Dimitriou', '#7c3aed'),
    getAvatarDataUri('Kostas Vasileiou', '#b45309'),
];

const LeadCapturePage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const { allCampaigns, isLoading: campaignsLoading } = useCampaigns();
    const { addLead } = useCrmData();
    const { t, language } = useLocalization();

    const [submitted, setSubmitted] = useState(false);

    const campaign = useMemo(() => {
        if (!campaignId || campaignsLoading) return null;
        return allCampaigns.find((c) => c.id === campaignId) || null;
    }, [campaignId, allCampaigns, campaignsLoading]);

    const campaignTheme = useMemo(() => {
        if (!campaign) return 'generic';
        const text = (campaign.name + campaign.creative.headline).toLowerCase();
        if (text.includes('home') || text.includes('enfia') || text.includes('κατοικία'))
            return 'home';
        if (text.includes('health') || text.includes('υγεία')) return 'health';
        if (text.includes('auto') || text.includes('car') || text.includes('αυτοκίνητο'))
            return 'auto';
        return 'generic';
    }, [campaign]);

    const inferredLine: PolicyType = useMemo(() => {
        if (campaignTheme === 'home') return PolicyType.HOME;
        if (campaignTheme === 'health') return PolicyType.HEALTH;
        return PolicyType.AUTO;
    }, [campaignTheme]);

    const [assetValue, setAssetValue] = useState<number>(() =>
        campaignTheme === 'home' ? 150000 : 18000
    );
    const [squareMeters, setSquareMeters] = useState<number>(110);
    const [includeCatastrophe, setIncludeCatastrophe] = useState<boolean>(true);
    const [insuredAge, setInsuredAge] = useState<number>(36);

    useEffect(() => {
        if (inferredLine === PolicyType.HOME && assetValue < 40000) {
            setAssetValue(150000);
        }
    }, [inferredLine, assetValue]);

    const quoteRange = useMemo(
        () =>
            getQuickQuoteRange({
                policyType: inferredLine,
                assetValue:
                    inferredLine === PolicyType.HOME && assetValue < 40000 ? 150000 : assetValue,
                squareMeters: inferredLine === PolicyType.HOME ? squareMeters : undefined,
                includeCatastrophePerils: includeCatastrophe,
                driverOrInsuredAge: insuredAge,
            }),
        [inferredLine, assetValue, squareMeters, includeCatastrophe, insuredAge]
    );

    const themeContent = useMemo(() => {
        if (campaignTheme === 'generic') return null;
        // @ts-ignore
        return t(`leadCapture.magnets.${campaignTheme}`);
    }, [campaignTheme, t]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!campaign) return;

        const formData = new FormData(e.currentTarget);
        const fullName = (formData.get('name') as string) || 'Interested Prospect';
        const [firstName, ...lastNameParts] = fullName.trim().split(' ');
        const lastName = lastNameParts.join(' ');

        addLead({
            agencyId: campaign.agencyId,
            firstName: firstName || 'Prospect',
            lastName: lastName || '',
            email: (formData.get('email') as string) || '',
            phone: (formData.get('phone') as string) || '',
            source: campaign.name,
            campaignId: campaign.id,
            status: LeadStatus.NEW,
            policyType: inferredLine,
            potentialValue: quoteRange.recommendedAnnual,
            score: 88,
            details: `Indicative calculator quote €${quoteRange.minMonthly}–€${quoteRange.maxMonthly}/mo (€${quoteRange.recommendedAnnual}/yr, asset €${assetValue.toLocaleString()})`,
        });

        setSubmitted(true);
    };

    if (campaignsLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-10 text-center border border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-900 mb-3">
                        {t('leadCapture.invalidCampaign')}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        This offer may have expired or the link is incorrect. Please contact our agency directly.
                    </p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-10 text-center border border-slate-200 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {t('leadCapture.thankYouTitle')}
                    </h1>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        {t('leadCapture.thankYouMessage')}
                    </p>
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-900 tabular-nums">
                        Locked Indicative Tariff: <strong>€{quoteRange.minMonthly} – €{quoteRange.maxMonthly}/mo</strong> across 6 carriers.
                    </div>
                </div>
            </div>
        );
    }

    const { creative, leadCaptureForm } = campaign;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            <header className="bg-white sticky top-0 z-40 border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="font-bold text-xl text-blue-700 flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <span>AgentOS Brokerage</span>
                    </div>
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider hidden sm:block">
                        EU IDD Licensed Comparative Rater
                    </div>
                </div>
            </header>

            <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
                <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column: Value Proposition + Live Indicative Calculator */}
                    <div className="flex flex-col justify-center space-y-6 order-2 lg:order-1">
                        {themeContent && (
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                                {themeContent.badge}
                            </p>
                        )}

                        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                            {creative.headline ||
                                (themeContent ? themeContent.title : t('leadCapture.title'))}
                        </h1>

                        <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                            {creative.body ||
                                (themeContent ? themeContent.subtitle : t('leadCapture.subtitle'))}
                        </p>

                        {/* Instant 6-Carrier Indicative Quote Calculator */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 tabular-nums">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block">
                                        Instant 6-Carrier Estimator
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Hellas Direct • Interamerican • Generali • Allianz • ERGO
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-extrabold text-slate-900">
                                        €{quoteRange.minMonthly}–€{quoteRange.maxMonthly}
                                    </span>
                                    <span className="text-xs text-slate-500 block">/ month</span>
                                </div>
                            </div>

                            {inferredLine === PolicyType.HOME ? (
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                                            <span>Property Rebuild Capital</span>
                                            <span>€{assetValue.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={60000}
                                            max={500000}
                                            step={10000}
                                            value={assetValue < 40000 ? 150000 : assetValue}
                                            onChange={(e) => setAssetValue(Number(e.target.value))}
                                            className="w-full accent-blue-600"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <label className="text-xs font-semibold text-slate-600">
                                            Area (sq.m.):{' '}
                                            <input
                                                type="number"
                                                min={35}
                                                max={600}
                                                value={squareMeters}
                                                onChange={(e) =>
                                                    setSquareMeters(Number(e.target.value) || 80)
                                                }
                                                className="ml-1 w-20 px-2 py-1 border border-slate-300 rounded-md text-slate-900"
                                            />
                                        </label>
                                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={includeCatastrophe}
                                                onChange={(e) =>
                                                    setIncludeCatastrophe(e.target.checked)
                                                }
                                                className="rounded text-blue-600"
                                            />
                                            Include Earthquake &amp; Flood
                                        </label>
                                    </div>
                                    {quoteRange.enfiaEligible && (
                                        <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                                            Qualifies for Statutory -20% Greek ENFIA Property Tax Discount
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                                            <span>
                                                {inferredLine === PolicyType.AUTO
                                                    ? 'Vehicle Market Value'
                                                    : 'Coverage Capital'}
                                            </span>
                                            <span>€{assetValue.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={4000}
                                            max={80000}
                                            step={2000}
                                            value={assetValue > 80000 ? 18000 : assetValue}
                                            onChange={(e) => setAssetValue(Number(e.target.value))}
                                            className="w-full accent-blue-600"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                                            <span>Primary Insured Age</span>
                                            <span>{insuredAge} yrs</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={19}
                                            max={75}
                                            value={insuredAge}
                                            onChange={(e) => setInsuredAge(Number(e.target.value))}
                                            className="w-full accent-blue-600"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-5 pt-4 border-t border-slate-200">
                            <div className="flex -space-x-3">
                                {SOCIAL_PROOF_AVATARS.map((uri, idx) => (
                                    <img
                                        key={idx}
                                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                                        src={uri}
                                        alt="Verified Policyholder"
                                    />
                                ))}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 tabular-nums">
                                    4.9 / 5.0 Policyholder Satisfaction
                                </p>
                                <p className="text-xs text-slate-500">
                                    Trusted by 500+ insured households across Greece
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Lead Capture Form */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                            {creative.image && (
                                <div className="relative h-44 w-full overflow-hidden">
                                    <img
                                        src={creative.image}
                                        alt="Campaign Visual"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">
                                    {language === 'el'
                                        ? 'Κλειδώστε την Προσφορά σας'
                                        : 'Lock Your Personalized Carrier Quotes'}
                                </h2>
                                <p className="text-xs text-slate-500 text-center mb-6 tabular-nums">
                                    Estimated annual tariff: €{quoteRange.recommendedAnnual}/yr
                                </p>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {(leadCaptureForm?.fields?.length
                                        ? leadCaptureForm.fields
                                        : [
                                              { name: 'name', type: 'text' as const, required: true },
                                              { name: 'email', type: 'email' as const, required: true },
                                              { name: 'phone', type: 'tel' as const, required: true },
                                          ]
                                    ).map((field) => (
                                        <div key={field.name}>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                                {t(`leadCapture.form.${field.name}` as any) ||
                                                    field.name}
                                            </label>
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                required={field.required}
                                                placeholder={
                                                    (t(`leadCapture.form.${field.name}` as any) as string) ||
                                                    field.name
                                                }
                                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 px-6 mt-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        {t('leadCapture.submitButton')}
                                    </button>
                                </form>

                                <p className="text-center text-xs text-slate-400 mt-5">
                                    GDPR Protected • Official EU Insurance Distribution Directive (IDD) Brokerage
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