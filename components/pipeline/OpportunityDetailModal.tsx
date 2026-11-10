import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Opportunity__EXT,
    Prospect,
    Interaction,
    PolicyType,
    OpportunityStage,
} from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import {
    CarrierQuote,
    generateComparativeQuotes,
} from '../../lib/comparativeRater';

interface OpportunityDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    opportunity: Opportunity__EXT | null;
    prospect: Prospect | null;
    interactions: Interaction[];
    onUpdateOpportunity: (opp: Opportunity__EXT) => void;
    onAddInteraction: (data: Omit<Interaction, 'id' | 'agentId' | 'agencyId' | 'createdAt'>) => void;
    onBindPolicy: (
        opportunity: Opportunity__EXT,
        quote: CarrierQuote,
        paymentMethod: 'IRIS' | 'Viva Wallet' | 'SEPA' | 'Card'
    ) => Promise<{ customerId: string; policyNumber: string }>;
}

const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
    isOpen,
    onClose,
    opportunity,
    prospect,
    interactions,
    onUpdateOpportunity,
    onAddInteraction,
    onBindPolicy,
}) => {
    const { t } = useLocalization();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'overview' | 'rater' | 'bind'>('overview');

    // Overview & Activity state
    const [noteChannel, setNoteChannel] = useState<Interaction['channel']>('call');
    const [noteText, setNoteText] = useState('');

    // Comparative Rater state
    const inferredLine = useMemo<PolicyType>(() => {
        const title = (opportunity?.title || '').toLowerCase();
        if (title.includes('home') || title.includes('κατοικ')) return PolicyType.HOME;
        if (title.includes('health') || title.includes('υγεί')) return PolicyType.HEALTH;
        if (title.includes('life') || title.includes('ζωή')) return PolicyType.LIFE;
        return PolicyType.AUTO;
    }, [opportunity?.title]);

    const [policyType, setPolicyType] = useState<PolicyType>(inferredLine);
    const [assetValue, setAssetValue] = useState<number>(inferredLine === PolicyType.HOME ? 160000 : 18000);
    const [squareMeters, setSquareMeters] = useState<number>(110);
    const [insuredAge, setInsuredAge] = useState<number>(38);
    const [includeCatastrophe, setIncludeCatastrophe] = useState<boolean>(true);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

    // Bind state
    const [paymentMethod, setPaymentMethod] = useState<'IRIS' | 'Viva Wallet' | 'SEPA' | 'Card'>('IRIS');
    const [isBinding, setIsBinding] = useState(false);
    const [boundResult, setBoundResult] = useState<{ customerId: string; policyNumber: string } | null>(null);

    const quotes = useMemo(
        () =>
            generateComparativeQuotes({
                policyType,
                assetValue,
                squareMeters: policyType === PolicyType.HOME ? squareMeters : undefined,
                driverOrInsuredAge: insuredAge,
                includeCatastrophePerils: includeCatastrophe,
            }),
        [policyType, assetValue, squareMeters, insuredAge, includeCatastrophe]
    );

    const activeQuote = useMemo(
        () => quotes.find((q) => q.id === selectedQuoteId) || quotes[0],
        [quotes, selectedQuoteId]
    );

    if (!isOpen || !opportunity) return null;

    const handleLogInteraction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        onAddInteraction({
            opportunityId: opportunity.id,
            channel: noteChannel,
            direction: 'outbound',
            content: noteText.trim(),
            read: true,
        });
        setNoteText('');
    };

    const handleApplyQuoteToDeal = (quote: CarrierQuote) => {
        setSelectedQuoteId(quote.id);
        onUpdateOpportunity({
            ...opportunity,
            value: quote.annualGrossPremium,
            stage: opportunity.stage === 'new' ? 'proposal' : opportunity.stage,
        });
    };

    const handleExecuteBind = async () => {
        if (!activeQuote) return;
        setIsBinding(true);
        try {
            const res = await onBindPolicy(opportunity, activeQuote, paymentMethod);
            setBoundResult(res);
        } finally {
            setIsBinding(false);
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={opportunity.title}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-center items-center p-4"
        >
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{opportunity.title}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {prospect ? `${prospect.firstName} ${prospect.lastName}` : 'Prospect'}
                            {prospect?.email ? ` · ${prospect.email}` : ''}
                            {prospect?.phone ? ` · ${prospect.phone}` : ''}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close deal modal"
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Segmented Tabs */}
                <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'overview'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        Overview &amp; Activity ({interactions.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('rater')}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'rater'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        Multi-Carrier Rater (6 Insurers)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('bind')}
                        className={`pb-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'bind'
                                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                    >
                        1-Click Bind &amp; Issue Policy
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                    <label htmlFor="opp-value-input" className="block text-xs font-medium text-slate-500 mb-1">
                                        Annual Gross Premium (€)
                                    </label>
                                    <input
                                        id="opp-value-input"
                                        type="number"
                                        value={opportunity.value}
                                        onChange={(e) =>
                                            onUpdateOpportunity({ ...opportunity, value: Number(e.target.value) || 0 })
                                        }
                                        className="w-full px-3 py-1.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 dark:text-white tabular-nums"
                                    />
                                </div>
                                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                    <label htmlFor="opp-stage-select" className="block text-xs font-medium text-slate-500 mb-1">
                                        Pipeline Stage
                                    </label>
                                    <select
                                        id="opp-stage-select"
                                        value={opportunity.stage}
                                        onChange={(e) =>
                                            onUpdateOpportunity({
                                                ...opportunity,
                                                stage: e.target.value as OpportunityStage,
                                            })
                                        }
                                        className="w-full px-3 py-1.5 text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 dark:text-white capitalize"
                                    >
                                        {(['new', 'contacted', 'proposal', 'won', 'lost'] as OpportunityStage[]).map(
                                            (st) => (
                                                <option key={st} value={st}>
                                                    {t(`pipeline.stages.${st}`)}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                    <label htmlFor="opp-followup-date" className="block text-xs font-medium text-slate-500 mb-1">
                                        Next Follow-Up Date
                                    </label>
                                    <input
                                        id="opp-followup-date"
                                        type="date"
                                        value={
                                            opportunity.nextFollowUpDate
                                                ? opportunity.nextFollowUpDate.split('T')[0]
                                                : ''
                                        }
                                        onChange={(e) =>
                                            onUpdateOpportunity({
                                                ...opportunity,
                                                nextFollowUpDate: e.target.value
                                                    ? new Date(e.target.value).toISOString()
                                                    : null,
                                            })
                                        }
                                        className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 dark:text-white tabular-nums"
                                    />
                                </div>
                            </div>

                            {/* Log Activity Form */}
                            <form onSubmit={handleLogInteraction} className="space-y-2">
                                <label htmlFor="interaction-note" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Log Outbound Activity / Call Disposition
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        aria-label="Interaction channel"
                                        value={noteChannel}
                                        onChange={(e) => setNoteChannel(e.target.value as Interaction['channel'])}
                                        className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="call">Phone Call</option>
                                        <option value="viber">Viber</option>
                                        <option value="email">Email</option>
                                        <option value="sms">SMS</option>
                                        <option value="note">Internal Note</option>
                                    </select>
                                    <input
                                        id="interaction-note"
                                        type="text"
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        placeholder="Summarize client discussion, quote feedback, or next step..."
                                        className="flex-1 px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-semibold bg-slate-900 dark:bg-blue-600 text-white rounded-lg hover:opacity-90 whitespace-nowrap"
                                    >
                                        Log Activity
                                    </button>
                                </div>
                            </form>

                            {/* Timeline */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Activity History</h3>
                                <div className="space-y-2.5">
                                    {interactions.map((interaction) => (
                                        <div
                                            key={interaction.id}
                                            className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-800/50"
                                        >
                                            <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                                                <span className="font-medium capitalize">
                                                    {interaction.channel} · {interaction.direction}
                                                </span>
                                                <span className="tabular-nums">
                                                    {new Date(interaction.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">
                                                {interaction.content}
                                            </p>
                                        </div>
                                    ))}
                                    {interactions.length === 0 && (
                                        <p className="text-sm text-slate-500 py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                                            No interactions logged yet. Log your first call or compare carrier quotes in the Rater tab.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'rater' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                <div>
                                    <label htmlFor="rater-line" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Line of Business
                                    </label>
                                    <select
                                        id="rater-line"
                                        value={policyType}
                                        onChange={(e) => {
                                            const next = e.target.value as PolicyType;
                                            setPolicyType(next);
                                            setAssetValue(next === PolicyType.HOME ? 160000 : next === PolicyType.LIFE ? 200000 : 16000);
                                        }}
                                        className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value={PolicyType.AUTO}>Auto / Motor</option>
                                        <option value={PolicyType.HOME}>Home / Property</option>
                                        <option value={PolicyType.HEALTH}>Health / Medical</option>
                                        <option value={PolicyType.LIFE}>Term Life</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="rater-capital" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Insured Value (€)
                                    </label>
                                    <input
                                        id="rater-capital"
                                        type="number"
                                        step={1000}
                                        value={assetValue}
                                        onChange={(e) => setAssetValue(Number(e.target.value) || 10000)}
                                        className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 dark:text-white tabular-nums"
                                    />
                                </div>
                                {policyType === PolicyType.HOME ? (
                                    <div>
                                        <label htmlFor="rater-sqm" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                            Area (sq.m.)
                                        </label>
                                        <input
                                            id="rater-sqm"
                                            type="number"
                                            value={squareMeters}
                                            onChange={(e) => setSquareMeters(Number(e.target.value) || 80)}
                                            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 dark:text-white tabular-nums"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label htmlFor="rater-age" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                            Insured Age
                                        </label>
                                        <input
                                            id="rater-age"
                                            type="number"
                                            value={insuredAge}
                                            onChange={(e) => setInsuredAge(Number(e.target.value) || 35)}
                                            className="w-full p-2 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 dark:text-white tabular-nums"
                                        />
                                    </div>
                                )}
                                <div className="flex flex-col justify-end">
                                    {policyType === PolicyType.HOME ? (
                                        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pb-2">
                                            <input
                                                type="checkbox"
                                                checked={includeCatastrophe}
                                                onChange={(e) => setIncludeCatastrophe(e.target.checked)}
                                                className="rounded text-blue-600"
                                            />
                                            <span>ENFIA -20% Perils</span>
                                        </label>
                                    ) : (
                                        <div className="text-xs text-slate-500 pb-2">
                                            Live Actuarial Tariff · 6 Carriers
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {quotes.map((q) => {
                                    const isSelected = activeQuote?.id === q.id;
                                    return (
                                        <div
                                            key={q.id}
                                            className={`p-4 rounded-xl border transition-colors ${
                                                isSelected
                                                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30'
                                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                                            }`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                                                        <span>{q.carrierName}</span>
                                                        <span className="text-slate-400">·</span>
                                                        <span className="text-xs font-medium text-slate-500">{q.tierLabel}</span>
                                                        {q.enfiaTaxDiscountEligible && (
                                                            <>
                                                                <span className="text-slate-400">·</span>
                                                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                                    ENFIA -20% Eligible
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        Deductible: {q.deductible} · Agency Commission:{' '}
                                                        <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                                                            €{q.commissionEuro.toFixed(2)} ({Math.round(q.commissionRate * 100)}%)
                                                        </span>{' '}
                                                        · Value Fit: <span className="tabular-nums">{q.valueScore}/100</span>
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                                                            €{q.annualGrossPremium.toLocaleString()}
                                                            <span className="text-xs font-normal text-slate-500">/yr</span>
                                                        </p>
                                                        <p className="text-xs text-slate-500 tabular-nums">
                                                            €{q.monthlyEquivalent.toFixed(2)}/mo
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApplyQuoteToDeal(q)}
                                                            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                                                        >
                                                            Apply to Deal
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleApplyQuoteToDeal(q);
                                                                setActiveTab('bind');
                                                            }}
                                                            className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg whitespace-nowrap"
                                                        >
                                                            Select &amp; Bind
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bind' && (
                        <div className="space-y-6">
                            {boundResult ? (
                                <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold text-xl">
                                        ✓
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            Policy Bound &amp; ACORD Record Issued
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                            Policy <span className="font-mono font-bold">{boundResult.policyNumber}</span> ({activeQuote?.carrierName}) is now active and synced to the Customer 360° Dossier.
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                navigate(`/customer/${boundResult.customerId}`);
                                            }}
                                            className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                        >
                                            Open 360° Customer Dossier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                navigate(`/wallet/${boundResult.customerId}`);
                                            }}
                                            className="px-4 py-2 text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg"
                                        >
                                            Preview Client Wallet
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                activeQuote && (
                                    <div className="space-y-5">
                                        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">Selected Carrier Offer</p>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                                                        {activeQuote.carrierName} — {activeQuote.tierLabel}
                                                    </h3>
                                                </div>
                                                <div className="text-right tabular-nums">
                                                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                                        €{activeQuote.annualGrossPremium.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        Agency Commission: €{activeQuote.commissionEuro.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <ul className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                {activeQuote.coverages.map((cov, idx) => (
                                                    <li key={idx} className="flex justify-between">
                                                        <span>{cov.type}</span>
                                                        <span className="font-mono font-semibold">{cov.limit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Premium Collection &amp; Settlement Method
                                            </label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {(['IRIS', 'Viva Wallet', 'SEPA', 'Card'] as const).map((method) => (
                                                    <button
                                                        key={method}
                                                        type="button"
                                                        onClick={() => setPaymentMethod(method)}
                                                        className={`py-2.5 px-3 text-xs font-semibold rounded-lg border transition-colors ${
                                                            paymentMethod === method
                                                                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        {method}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={isBinding}
                                            onClick={handleExecuteBind}
                                            className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm disabled:opacity-50 transition-colors"
                                        >
                                            {isBinding
                                                ? 'Issuing ACORD Contract...'
                                                : `Bind Policy (€${activeQuote.annualGrossPremium}/yr) & Onboard Client`}
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg hover:opacity-90"
                    >
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpportunityDetailModal;
