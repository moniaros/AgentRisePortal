import React, { useState } from 'react';
import { TransactionInquiry, Language } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { GoogleGenAI } from '@google/genai';

interface LeadQuickViewProps {
    inquiry: TransactionInquiry | null;
    isOpen: boolean;
    onClose: () => void;
    onCreateOpportunity: (inquiry: TransactionInquiry) => void;
}

const LeadQuickView: React.FC<LeadQuickViewProps> = ({ inquiry, isOpen, onClose, onCreateOpportunity }) => {
    const { t, language } = useLocalization();
    const [activeTab, setActiveTab] = useState<'details' | 'ai_assistant'>('details');
    const [generatedScript, setGeneratedScript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedTone, setSelectedTone] = useState<'formal' | 'friendly'>('formal');

    if (!isOpen || !inquiry) return null;

    const scoreFactors = [
        { label: inquiry.source === 'Referral' ? 'High Trust Source' : 'Standard Source', impact: 'positive' },
        { label: inquiry.contact.phone ? 'Phone Verified' : 'No Phone', impact: inquiry.contact.phone ? 'positive' : 'neutral' },
        { label: inquiry.consentGDPR ? 'GDPR Consented' : 'GDPR Missing', impact: inquiry.consentGDPR ? 'positive' : 'negative' },
        { label: 'Policy Intent: ' + inquiry.policyType, impact: 'neutral' }
    ];

    const handleGenerateScript = async (angle: 'tax' | 'value' | 'bank_objection' | 'expensive_objection' | 'kteo_reminder') => {
        if (!process.env.API_KEY) return;
        setIsGenerating(true);
        setGeneratedScript('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const targetLang = language === Language.EL ? 'Greek' : 'English';
            
            let context = '';
            switch(angle) {
                case 'tax':
                    context = 'Focus on the ENFIA (Property Tax) reduction benefit for home insurance in Greece. Explain how they can save 10% on taxes. Use specific details from their inquiry if available.';
                    break;
                case 'value':
                    context = 'Focus on value over price. Mention Roadside Assistance (Odiki Voithia), Glass Breakage (Thrafsi Krystallon), and 24/7 support. Do not compete on just being the cheapest.';
                    break;
                case 'bank_objection':
                    context = 'Handle the "I have insurance with my mortgage bank" objection. Explain that they are LEGALLY allowed to choose their own provider and often save 30-40% with better coverage. Be authoritative but polite.';
                    break;
                case 'expensive_objection':
                    context = 'Handle the "It is too expensive" objection. Mention monthly payment plans (mhniaies doseis) via credit card and the high cost of paying damages out of pocket.';
                    break;
                case 'kteo_reminder':
                    context = 'Mention the upcoming KTEO inspection (if applicable) or police checks as a reason to ensure insurance is valid immediately. Stress the fine for uninsured vehicles.';
                    break;
            }

            const toneInstruction = selectedTone === 'formal' 
                ? 'Use "Formal" tone (Plural/Polite - "Εσείς/Σας"). Professional and respectful.' 
                : 'Use "Friendly" tone (Singular/Warm - "Εσύ/Σου"). Approachable but professional.';

            const prompt = `
                Act as a world-class insurance sales agent in the Greek market.
                Write a short, persuasive sales script (optimized for WhatsApp/Viber - keep it under 60 words) for this lead.
                
                Lead Name: ${inquiry.contact.firstName}
                Interest: ${inquiry.policyType}
                Lead Details: "${inquiry.details}"
                
                Strategy: ${context}
                Tone: ${toneInstruction}
                Language: ${targetLang} ONLY.
                
                Structure:
                1. Personal greeting.
                2. Hook (The benefit/strategy/counter-argument).
                3. Soft Call to Action (Question).
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setGeneratedScript(response.text?.trim() || '');
        } catch (error) {
            console.error("Error generating script", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDisposition = (type: string) => {
        // In a real app, this would log an activity to the backend
        alert(`Logged action: ${type}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/20 pointer-events-auto transition-opacity" 
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl pointer-events-auto flex flex-col transform transition-transform animate-fade-in border-l dark:border-gray-700">
                
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {inquiry.contact.firstName} {inquiry.contact.lastName}
                                </h2>
                                <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                                    New Lead
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">{inquiry.contact.email}</p>
                            <p className="text-sm text-gray-500">{inquiry.contact.phone}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-4 border-b dark:border-gray-600">
                        <button 
                            onClick={() => setActiveTab('details')}
                            className={`pb-2 text-sm font-medium ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                        >
                            {language === Language.EL ? 'Λεπτομέρειες' : 'Lead Context'}
                        </button>
                        <button 
                            onClick={() => setActiveTab('ai_assistant')}
                            className={`pb-2 text-sm font-medium ${activeTab === 'ai_assistant' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                        >
                            {language === Language.EL ? 'AI Βοηθός Πώλησης' : 'AI Sales Assistant'}
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    
                    {activeTab === 'details' ? (
                        <>
                            {/* Score Card */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-3">
                                    {language === Language.EL ? 'Ανάλυση Ποιότητας' : 'Lead Intelligence'}
                                </h3>
                                <div className="space-y-2">
                                    {scoreFactors.map((factor, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                            <span className={factor.impact === 'positive' ? 'text-green-500' : factor.impact === 'negative' ? 'text-red-500' : 'text-gray-400'}>
                                                {factor.impact === 'positive' ? '✔' : factor.impact === 'negative' ? '✖' : '•'}
                                            </span>
                                            <span className="text-gray-700 dark:text-gray-300">{factor.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Context / Details */}
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Inquiry Context</h3>
                                <div className="p-3 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 italic">
                                    "{inquiry.details || 'No specific details provided.'}"
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 border dark:border-gray-600">
                                        Source: {inquiry.source}
                                    </span>
                                    {inquiry.attribution?.utm_campaign && (
                                        <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-800">
                                            Campaign: {inquiry.attribution.utm_campaign}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Dispositions (Enterprise Feature) */}
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('pipeline.disposition')}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => handleDisposition('vm')} className="p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-center">
                                        📞 {t('pipeline.quickActions.leftVm')}
                                    </button>
                                    <button onClick={() => handleDisposition('callback')} className="p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-center">
                                        🕐 {t('pipeline.quickActions.badTiming')}
                                    </button>
                                    <button onClick={() => handleDisposition('wrong_number')} className="p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-center">
                                        🚫 {t('pipeline.quickActions.wrongNumber')}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
                                <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2">
                                    {language === Language.EL ? 'Στρατηγική & Ύφος' : 'Strategy & Tone'}
                                </h3>
                                
                                {/* Tone Selector */}
                                <div className="flex gap-2 mb-4">
                                    <button 
                                        onClick={() => setSelectedTone('formal')}
                                        className={`flex-1 py-1.5 text-xs rounded-md border transition ${selectedTone === 'formal' ? 'bg-white border-purple-300 text-purple-700 shadow-sm font-bold' : 'border-transparent text-gray-500 hover:bg-white/50'}`}
                                    >
                                        👔 {language === Language.EL ? 'Τυπικό (Εσείς)' : 'Formal'}
                                    </button>
                                    <button 
                                        onClick={() => setSelectedTone('friendly')}
                                        className={`flex-1 py-1.5 text-xs rounded-md border transition ${selectedTone === 'friendly' ? 'bg-white border-purple-300 text-purple-700 shadow-sm font-bold' : 'border-transparent text-gray-500 hover:bg-white/50'}`}
                                    >
                                        👋 {language === Language.EL ? 'Φιλικό (Εσύ)' : 'Friendly'}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">
                                    {language === Language.EL ? 'Επιλέξτε σενάριο:' : 'Choose scenario:'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {inquiry.policyType === 'home' && (
                                        <>
                                            <button 
                                                onClick={() => handleGenerateScript('tax')} 
                                                className="px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-full shadow-sm hover:bg-purple-50 text-purple-700 transition flex items-center gap-1"
                                            >
                                                📉 ENFIA Benefit
                                            </button>
                                            <button 
                                                onClick={() => handleGenerateScript('bank_objection')} 
                                                className="px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-full shadow-sm hover:bg-purple-50 text-purple-700 transition flex items-center gap-1"
                                            >
                                                🏦 Vs Bank Insurance
                                            </button>
                                        </>
                                    )}
                                    <button 
                                        onClick={() => handleGenerateScript('value')} 
                                        className="px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-full shadow-sm hover:bg-purple-50 text-purple-700 transition flex items-center gap-1"
                                    >
                                        💎 Sell Value
                                    </button>
                                    <button 
                                        onClick={() => handleGenerateScript('expensive_objection')} 
                                        className="px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-full shadow-sm hover:bg-purple-50 text-purple-700 transition flex items-center gap-1"
                                    >
                                        🛡️ "Too Expensive"
                                    </button>
                                    {inquiry.policyType === 'auto' && (
                                        <button 
                                            onClick={() => handleGenerateScript('kteo_reminder')} 
                                            className="px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-full shadow-sm hover:bg-purple-50 text-purple-700 transition flex items-center gap-1"
                                        >
                                            🚗 KTEO / Police
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="min-h-[180px] p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700 relative flex flex-col">
                                {isGenerating ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                            <p className="text-xs text-purple-600 animate-pulse">Writing perfect script...</p>
                                        </div>
                                    </div>
                                ) : generatedScript ? (
                                    <>
                                        <div className="flex-grow whitespace-pre-wrap leading-relaxed text-sm text-gray-800 dark:text-gray-200 font-medium">
                                            {generatedScript}
                                        </div>
                                        <div className="flex gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(generatedScript)}
                                                className="flex-1 py-2 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition"
                                            >
                                                Copy Text
                                            </button>
                                            <a 
                                                href={`https://wa.me/${inquiry.contact.phone.replace(/\D/g,'')}?text=${encodeURIComponent(generatedScript)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 py-2 text-xs bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center gap-2 transition"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                            </a>
                                            <a 
                                                href={`viber://chat?number=${inquiry.contact.phone.replace(/\D/g,'')}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex-1 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center justify-center gap-2 transition"
                                            >
                                                {/* Viber Icon */}
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.62 16.59c-.67-.24-2.32-.94-2.69-1.05-.45-.13-.93-.02-1.29.34l-1.61 1.6c-.26.26-.63.31-.96.14-3.35-1.72-5.55-3.93-7.27-7.27-.17-.33-.12-.71.14-.96l1.6-1.61c.36-.36.47-.84.34-1.29-.11-.38-.81-2.03-1.05-2.69-.31-.85-1.18-1.18-1.91-1.18h-1.6c-.88 0-1.73.53-2.03 1.35-.37 1.01-.59 2.66-.59 2.66 0 7.38 6 13.38 13.38 13.38 0 0 1.65-.22 2.66-.59.82-.3 1.35-1.15 1.35-2.03v-1.6c0-.73-.33-1.6-1.18-1.91zM4.31 6.03c.06-.17.16-.27.27-.27h1.6c.11 0 .22.05.27.17.05.13.68 1.58.77 1.83.02.06.02.13-.02.18l-1.41 1.41-.49-.49c.16-.41.78-2.06 1.05-2.69zm13.65 13.65c.12.05.17.16.17.27v1.6c0 .11-.1.21-.27.27-.63.27-2.28.89-2.69 1.05-.42.16-2.07.78-2.69 1.05l-.49-.49 1.41-1.41c.05-.04.12-.04.18-.02.25.09 1.7.72 1.83.77z"/></svg>
                                                Viber
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center mt-10">
                                        Select a strategy above to generate a script.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Sticky Footer Actions */}
                <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2">
                        <a href={`tel:${inquiry.contact.phone}`} className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-600 transition">
                            <span className="text-lg">📞</span>
                            <span className="text-[10px] font-bold uppercase mt-1">Call</span>
                        </a>
                        <a href={`mailto:${inquiry.contact.email}`} className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-600 transition">
                            <span className="text-lg">✉️</span>
                            <span className="text-[10px] font-bold uppercase mt-1">Email</span>
                        </a>
                        <a href={`https://wa.me/${inquiry.contact.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-green-600 transition">
                            <span className="text-lg">💬</span>
                            <span className="text-[10px] font-bold uppercase mt-1">WhatsApp</span>
                        </a>
                    </div>
                    <button 
                        onClick={() => onCreateOpportunity(inquiry)}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 shadow-lg transition flex items-center justify-center gap-2"
                    >
                        {t('pipeline.createOpportunity')} &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadQuickView;