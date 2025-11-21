
import React, { useState, useMemo, useEffect } from 'react';
import { TransactionInquiry, Language } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { GoogleGenAI } from '@google/genai';

interface LeadRowProps {
    inquiry: TransactionInquiry;
    onCreateOpportunity: (inquiry: TransactionInquiry) => void;
    onViewDetails?: () => void;
}

const LeadRow: React.FC<LeadRowProps> = ({ inquiry, onCreateOpportunity, onViewDetails }) => {
    const { t, language } = useLocalization();
    const [isExpanded, setIsExpanded] = useState(false);
    const [aiScript, setAiScript] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const calculateTimeAgo = () => {
            const diff = Date.now() - new Date(inquiry.createdAt).getTime();
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(minutes / 60);
            
            if (minutes < 1) return language === Language.EL ? 'Μόλις τώρα' : 'Just now';
            if (minutes < 60) return `${minutes}m`;
            if (hours < 24) return `${hours}h`;
            return `${Math.floor(hours / 24)}d`;
        };

        setTimeAgo(calculateTimeAgo());
        const interval = setInterval(() => setTimeAgo(calculateTimeAgo()), 60000);
        return () => clearInterval(interval);
    }, [inquiry.createdAt, language]);

    const leadScore = useMemo(() => {
        let score = 50;
        if (inquiry.source === 'Referral') score += 30;
        if (inquiry.source === 'Microsite') score += 20;
        if (inquiry.policyType === 'life' || inquiry.policyType === 'business') score += 15;
        if (inquiry.contact.phone && inquiry.contact.email) score += 10;
        if (inquiry.consentGDPR) score += 5;
        return Math.min(score, 100);
    }, [inquiry]);

    const isFamilyBundle = useMemo(() => {
        // Simple check for demo purposes - usually this checks DB
        return inquiry.details?.toLowerCase().includes('brother') || inquiry.details?.toLowerCase().includes('family') || inquiry.source === 'Referral';
    }, [inquiry]);

    // Mock potential value estimation if not present
    const estimatedValue = useMemo(() => {
        // Use dummy logic to assign values for visuals
        if (inquiry.policyType === 'life') return 2500;
        if (inquiry.policyType === 'home') return 600;
        if (inquiry.policyType === 'auto') return 300;
        return 400;
    }, [inquiry]);

    const isHighValue = estimatedValue >= 1000;

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
        if (s >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    };

    const generateIceBreaker = async () => {
        if (!process.env.API_KEY) return;
        setIsThinking(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const targetLang = language === Language.EL ? 'Greek' : 'English';
            
            const prompt = `
                You are a top-tier sales agent. Write a short, punchy, and warm opening message (SMS/Viber/WhatsApp) to a new lead.
                Language: ${targetLang} ONLY.
                Lead Name: ${inquiry.contact.firstName}
                Interest: ${inquiry.policyType} Insurance
                Source: ${inquiry.source} (If referral, mention we were recommended. If Facebook/Microsite, mention they just clicked).
                Goal: Get a reply. End with a simple question. No hashtags. Max 2 sentences.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setAiScript(response.text?.trim() || '');
        } catch (error) {
            console.error("AI Script Error", error);
        } finally {
            setIsThinking(false);
        }
    };

    const isFresh = (Date.now() - new Date(inquiry.createdAt).getTime()) < 1000 * 60 * 60; 

    const getSourceIcon = (source: string) => {
        const s = source.toLowerCase();
        if (s.includes('facebook')) return '🔵'; // Facebook Blue
        if (s.includes('instagram')) return '🟣'; // Insta gradient-ish
        if (s.includes('linkedin')) return '🟦'; // LinkedIn Blue
        if (s.includes('referral')) return '🤝';
        return '🌐';
    };

    return (
        <div className={`p-4 border-l-4 transition-all duration-200 hover:shadow-md ${isFresh ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600'}`}>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-grow cursor-pointer" onClick={onViewDetails}>
                    {/* Freshness Badge */}
                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${isFresh ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                        <span className="text-xs font-bold uppercase">{timeAgo}</span>
                        <span className="text-[10px]">{language === Language.EL ? 'πριν' : 'ago'}</span>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 transition">
                                {inquiry.contact.firstName} {inquiry.contact.lastName}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${getScoreColor(leadScore)}`}>
                                {leadScore}
                            </span>
                            {isFamilyBundle && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-pink-100 text-pink-800 border border-pink-200 rounded uppercase font-bold flex items-center gap-1">
                                    👨‍👩‍👧‍👦 {t('pipeline.familyBundle')}
                                </span>
                            )}
                            {isHighValue && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded uppercase font-bold flex items-center gap-1">
                                    💎 High Value
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className="capitalize font-medium text-blue-600 dark:text-blue-400">{inquiry.policyType}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                {getSourceIcon(inquiry.source)} {inquiry.source}
                            </span>
                            {inquiry.attribution?.utm_campaign && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 rounded text-gray-500 hidden sm:inline-block">
                                    #{inquiry.attribution.utm_campaign}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions Toolbar */}
                <div className="flex items-center gap-2 self-end md:self-auto">
                    <a 
                        href={`https://wa.me/${inquiry.contact.phone.replace(/\D/g,'')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-green-600 bg-green-100 hover:bg-green-200 rounded-full transition"
                        title="WhatsApp"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    </a>
                    <a 
                        href={`viber://chat?number=${inquiry.contact.phone.replace(/\D/g,'')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 text-purple-600 bg-purple-100 hover:bg-purple-200 rounded-full transition"
                        title="Viber"
                    >
                        {/* Viber Icon Placeholder */}
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.62 16.59c-.67-.24-2.32-.94-2.69-1.05-.45-.13-.93-.02-1.29.34l-1.61 1.6c-.26.26-.63.31-.96.14-3.35-1.72-5.55-3.93-7.27-7.27-.17-.33-.12-.71.14-.96l1.6-1.61c.36-.36.47-.84.34-1.29-.11-.38-.81-2.03-1.05-2.69-.31-.85-1.18-1.18-1.91-1.18h-1.6c-.88 0-1.73.53-2.03 1.35-.37 1.01-.59 2.66-.59 2.66 0 7.38 6 13.38 13.38 13.38 0 0 1.65-.22 2.66-.59.82-.3 1.35-1.15 1.35-2.03v-1.6c0-.73-.33-1.6-1.18-1.91zM4.31 6.03c.06-.17.16-.27.27-.27h1.6c.11 0 .22.05.27.17.05.13.68 1.58.77 1.83.02.06.02.13-.02.18l-1.41 1.41-.49-.49c.16-.41.78-2.06 1.05-2.69zm13.65 13.65c.12.05.17.16.17.27v1.6c0 .11-.1.21-.27.27-.63.27-2.28.89-2.69 1.05-.42.16-2.07.78-2.69 1.05l-.49-.49 1.41-1.41c.05-.04.12-.04.18-.02.25.09 1.7.72 1.83.77z"/></svg>
                    </a>
                    <a 
                        href={`tel:${inquiry.contact.phone}`} 
                        className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-full transition"
                        title="Call"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </a>
                    
                    <button 
                        onClick={() => onCreateOpportunity(inquiry)}
                        className="ml-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 shadow-sm transition flex items-center gap-2"
                    >
                        <span>{t('pipeline.createOpportunity')}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>

            {/* Expandable AI Assistant Area */}
            <div className="mt-3 flex flex-col sm:flex-row gap-4 border-t dark:border-gray-700 pt-3">
                <div className="flex-grow">
                    {!isExpanded ? (
                        <div className="flex gap-4">
                            <button 
                                onClick={() => { setIsExpanded(true); generateIceBreaker(); }}
                                className="text-xs font-semibold text-purple-600 flex items-center gap-1 hover:underline"
                            >
                                <span>✨</span>
                                {language === Language.EL ? 'Δημιουργία Ice-Breaker (AI)' : 'Generate Ice-Breaker (AI)'}
                            </button>
                            {onViewDetails && (
                                <button 
                                    onClick={onViewDetails}
                                    className="text-xs font-semibold text-gray-500 flex items-center gap-1 hover:underline"
                                >
                                    {language === Language.EL ? 'Προβολή Πλήρους Προφίλ' : 'View Full Profile'} &rarr;
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-100 dark:border-purple-800">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">AI Suggested Opener</h4>
                                    <button onClick={generateIceBreaker} className="text-xs text-purple-600 hover:underline" disabled={isThinking}>
                                        {isThinking ? 'Thinking...' : 'Regenerate'}
                                    </button>
                                </div>
                                {isThinking ? (
                                    <div className="h-10 flex items-center justify-center">
                                        <div className="animate-pulse w-4 h-4 bg-purple-400 rounded-full"></div>
                                    </div>
                                ) : (
                                    <div className="relative group cursor-pointer" onClick={() => { navigator.clipboard.writeText(aiScript || ''); }}>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 italic">"{aiScript}"</p>
                                        <span className="absolute top-0 right-0 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100">Click to copy</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-end justify-end">
                                <button onClick={() => setIsExpanded(false)} className="text-xs text-gray-400 hover:text-gray-600 underline">Hide AI</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadRow;
