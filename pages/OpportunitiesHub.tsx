
import React, { useMemo, useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAllVerifiedOpportunities } from '../hooks/useAllVerifiedOpportunities';
import { getStoredFindings } from '../services/findingsStorage';
import { useCrmData } from '../hooks/useCrmData';
import { StoredFinding, Customer, Language } from '../types';
import { useAuth } from '../hooks/useAuth';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { Link, useNavigate } from 'react-router-dom';
import { generateGeminiContent } from '../services/geminiClient';
import { usePipelineData } from '../hooks/usePipelineData';
import { useNotification } from '../hooks/useNotification';

// --- Types ---
interface EnrichedOpportunity extends StoredFinding {
    estimatedValue: number;
    customer?: Customer;
}

// --- Mock Value Logic ---
const estimateValue = (finding: StoredFinding): number => {
    const text = (finding.title + finding.description).toLowerCase();
    if (text.includes('life') || text.includes('ζωής')) return 1200;
    if (text.includes('health') || text.includes('υγείας')) return 800;
    if (text.includes('home') || text.includes('κατοικίας') || text.includes('fire')) return 350;
    if (text.includes('auto') || text.includes('vehicle')) return 250;
    return 150;
};

// --- Components ---

const PitchGeneratorModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    opportunity: EnrichedOpportunity; 
}> = ({ isOpen, onClose, opportunity }) => {
    const { t, language } = useLocalization();
    const [script, setScript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePitch = async () => {
        setIsGenerating(true);
        
        try {
            let marketHook = "";
            const lowerTitle = opportunity.title.toLowerCase();
            if (lowerTitle.includes('home') || lowerTitle.includes('fire')) {
                marketHook = t('pipeline.opportunitiesHub.marketHook.home');
            } else if (lowerTitle.includes('health')) {
                marketHook = t('pipeline.opportunitiesHub.marketHook.health');
            } else if (lowerTitle.includes('auto')) {
                marketHook = t('pipeline.opportunitiesHub.marketHook.auto');
            }

            const prompt = `
                Role: You are a senior strategic insurance advisor in Greece. Your goal is to initiate a high-value conversation with an existing client, shifting from "selling" to "advising".

                Client Profile:
                - Name: ${opportunity.customer?.firstName || 'Client'}
                - Opportunity Type: ${opportunity.type === 'upsell' ? 'Critical Policy Upgrade' : 'Strategic Cross-Sell'}
                - Identified Risk/Gap: "${opportunity.title}"
                - Specific Context: ${opportunity.description}
                - Primary Benefit: ${opportunity.benefit || 'Financial Protection'}
                - Market Driver: ${marketHook}

                Task: Write a short, persuasive message (optimized for WhatsApp/Viber).

                Directives:
                1. **Psychological Trigger:** Use "Loss Aversion". Highlight what they are risking by *not* having this coverage (e.g., paying damages out of pocket, missing tax breaks, family vulnerability).
                2. **Tone:** Professional, concise, and "Insider". Avoid generic marketing fluff. Sound like their personal advisor giving a helpful heads-up.
                3. **Structure:**
                   - Personal Salutation.
                   - The "Trigger": Connect the ${marketHook} or their specific situation to the identified risk.
                   - The "Value": Briefly state how this specific solution mitigates that risk.
                   - Low-Friction Ask: A simple, no-pressure question (e.g., "Would you like me to send over the numbers?" or "Do you have a minute to discuss this?").
                4. **Format:** Max 50 words. Use line breaks for readability. 1-2 relevant emojis to keep it conversational.
                5. **Language:** Modern Business Greek (Native speaker level).
            `;

            const text = await generateGeminiContent({
                contents: prompt,
            });

            setScript(text.trim());
        } catch (e) {
            console.error(e);
            setScript(t('pipeline.opportunitiesHub.errorGenerating'));
        } finally {
            setIsGenerating(false);
        }
    };

    // Auto-generate on open
    React.useEffect(() => {
        if (isOpen && !script) {
            generatePitch();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span>✨</span> {t('pipeline.opportunitiesHub.pitchTitle')}
                    </h3>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 uppercase font-bold">{t('pipeline.opportunitiesHub.pitchSubtitle')}</p>
                        <p className="font-medium text-gray-900 dark:text-white">{opportunity.title}</p>
                    </div>
                    
                    <div className="relative">
                        {isGenerating ? (
                            <div className="h-32 flex flex-col items-center justify-center text-purple-600 bg-purple-50 rounded-lg">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mb-2"></div>
                                <span className="text-xs font-semibold animate-pulse">{t('pipeline.opportunitiesHub.generating')}</span>
                            </div>
                        ) : (
                            <textarea 
                                className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition">
                            {t('pipeline.opportunitiesHub.close')}
                        </button>
                        <button 
                            onClick={() => navigator.clipboard.writeText(script)}
                            className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition flex items-center gap-2"
                        >
                            <span>📋</span> {t('pipeline.opportunitiesHub.copy')}
                        </button>
                        {opportunity.customer?.phone && (
                             <a 
                                href={`https://wa.me/${opportunity.customer.phone.replace(/\D/g,'')}?text=${encodeURIComponent(script)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition flex items-center gap-2"
                            >
                                <span>💬</span> WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const OpportunityCard: React.FC<{
    item: EnrichedOpportunity;
    onPitch: (item: EnrichedOpportunity) => void;
    onCreateDeal: (item: EnrichedOpportunity) => void;
}> = ({ item, onPitch, onCreateDeal }) => {
    const { t } = useLocalization();

    const emailSubject = `Important: ${item.title}`;
    const emailBody = `Hi ${item.customer?.firstName},\n\nI was reviewing your current policies and identified a potential opportunity that might benefit you: ${item.title}.\n\n${item.description}\n\nWould you be open to a quick chat about this?\n\nBest,`;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-400 dark:hover:border-blue-600 transition-colors flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold capitalize">{item.type}</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        €{item.estimatedValue}/yr
                    </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h3>

                <div className="flex items-center gap-2 mb-3 text-xs text-slate-600 dark:text-slate-300">
                    <Link
                        to={`/customer/${item.customerId}`}
                        className="font-medium hover:text-blue-600 hover:underline"
                    >
                        {item.customer?.firstName} {item.customer?.lastName}
                    </Link>
                    {item.priority && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span>{item.priority} Priority</span>
                        </>
                    )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {item.description}
                </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => onPitch(item)}
                        className="py-2 px-3 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition whitespace-nowrap"
                    >
                        {t('pipeline.opportunitiesHub.aiPitch')}
                    </button>
                    <button
                        type="button"
                        onClick={() => onCreateDeal(item)}
                        className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition whitespace-nowrap"
                    >
                        Send to Pipeline
                    </button>
                </div>
                <div className="flex justify-between text-xs text-slate-500 pt-1">
                    <a href={`tel:${item.customer?.phone || ''}`} className="hover:text-slate-900 dark:hover:text-white">
                        Call Client
                    </a>
                    <a
                        href={`mailto:${item.customer?.email || ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                        className="hover:text-slate-900 dark:hover:text-white"
                    >
                        Send Email
                    </a>
                </div>
            </div>
        </div>
    );
};

const OpportunitiesHub: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { customers } = useCrmData();
    const { isLoading } = useAllVerifiedOpportunities();
    const { createOpportunityFromFinding } = usePipelineData();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const [pitchModalOpen, setPitchModalOpen] = useState(false);
    const [selectedOpp, setSelectedOpp] = useState<EnrichedOpportunity | null>(null);

    const { opportunities, totalPipelineValue } = useMemo(() => {
        if (!currentUser?.agencyId) return { opportunities: [], totalPipelineValue: 0 };

        const allFindings = getStoredFindings(currentUser.agencyId);

        const enriched: EnrichedOpportunity[] = allFindings
            .filter(f => f.status === 'verified' && (f.type === 'upsell' || f.type === 'cross-sell'))
            .map(f => {
                const customer = customers.find(c => c.id === f.customerId);
                return {
                    ...f,
                    customer,
                    estimatedValue: f.estimatedValue || estimateValue(f)
                };
            })
            .sort((a, b) => b.estimatedValue - a.estimatedValue);

        const totalValue = enriched.reduce((sum, item) => sum + item.estimatedValue, 0);

        return { opportunities: enriched, totalPipelineValue: totalValue };
    }, [currentUser, customers]);

    const handlePitch = (opp: EnrichedOpportunity) => {
        setSelectedOpp(opp);
        setPitchModalOpen(true);
    };

    const handleCreateDeal = (opp: EnrichedOpportunity) => {
        createOpportunityFromFinding(opp, opp.customer);
        addNotification(`Created Pipeline Proposal for ${opp.title}`, 'success');
        navigate('/pipeline/board');
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <SkeletonLoader className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SkeletonLoader className="h-48 w-full" />
                    <SkeletonLoader className="h-48 w-full" />
                    <SkeletonLoader className="h-48 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            
            {/* Header / Pipeline Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('pipeline.opportunitiesHub.title')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {t('pipeline.opportunitiesHub.description')}
                        </p>
                    </div>
                    <div className="flex gap-8 text-center">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('pipeline.opportunitiesHub.opportunities')}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{opportunities.length}</p>
                        </div>
                        <div className="pl-8 border-l dark:border-gray-700">
                            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">{t('pipeline.opportunitiesHub.pipelineValue')}</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                €{totalPipelineValue.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Opportunities Grid */}
            {opportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {opportunities.map(opp => (
                        <OpportunityCard 
                            key={opp.id} 
                            item={opp} 
                            onPitch={handlePitch}
                            onCreateDeal={handleCreateDeal}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('pipeline.opportunitiesHub.noOpportunities')}</h3>
                    <p className="text-gray-500 mt-2">{t('pipeline.opportunitiesHub.noOpportunitiesSub')}</p>
                    <Link to="/gap-analysis" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('pipeline.opportunitiesHub.goToScanner')}
                    </Link>
                </div>
            )}

            {/* AI Pitch Modal */}
            {selectedOpp && (
                <PitchGeneratorModal 
                    isOpen={pitchModalOpen} 
                    onClose={() => setPitchModalOpen(false)} 
                    opportunity={selectedOpp} 
                />
            )}
        </div>
    );
};

export default OpportunitiesHub;
