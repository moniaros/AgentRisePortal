import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Opportunity__EXT, Prospect, TransactionInquiry } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { isPast, isToday, parseISO, differenceInDays } from 'date-fns';
import { usePrevious } from '../../../hooks/usePrevious';
import { GoogleGenAI } from '@google/genai';

interface OpportunityCardProps {
    opportunity: Opportunity__EXT;
    prospect?: Prospect;
    inquiry?: TransactionInquiry;
    probability?: number;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, prospect, inquiry, probability = 0 }) => {
    const { t, language } = useLocalization();
    const [isJustUpdated, setIsJustUpdated] = useState(false);
    const [showPitch, setShowPitch] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pitchText, setPitchText] = useState('');
    
    const prevUpdatedAt = usePrevious(opportunity.updatedAt);

    const isDraggable = !['won', 'lost'].includes(opportunity.stage);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'opportunity',
        item: { id: opportunity.id },
        canDrag: isDraggable,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [opportunity.id, isDraggable]);
    
    useEffect(() => {
        if (prevUpdatedAt && opportunity.updatedAt !== prevUpdatedAt && !isDragging) {
            setIsJustUpdated(true);
            const timer = setTimeout(() => setIsJustUpdated(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [opportunity.updatedAt, prevUpdatedAt, isDragging]);

    const generatePitch = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowPitch(true);
        if (pitchText) return; // Already generated

        if (!process.env.API_KEY) {
            setPitchText("API Key missing.");
            return;
        }

        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const targetLang = language === 'el' ? 'Greek' : 'English';
            
            const prompt = `
                Act as a world-class insurance agent. Write a short, warm, and persuasive opening message (for SMS/WhatsApp) to a prospect.
                
                Prospect Name: ${prospect?.firstName || 'Client'}
                Lead Source: ${inquiry?.source || 'Referral'}
                Policy Interest: ${inquiry?.policyType || 'General Insurance'}
                Details: ${inquiry?.details || ''}
                
                Tone: Professional but approachable.
                Language: ${targetLang} ONLY.
                Length: Max 40 words.
                Goal: Schedule a call.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            setPitchText(response.text?.trim() || "Could not generate pitch.");
        } catch (err) {
            console.error("Pitch generation failed", err);
            setPitchText("Error generating pitch.");
        } finally {
            setIsGenerating(false);
        }
    };

    const closePitch = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowPitch(false);
    };

    const copyPitch = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(pitchText);
    };

    // Deal Health Logic
    const daysSinceUpdate = differenceInDays(new Date(), new Date(opportunity.updatedAt));
    const isStale = daysSinceUpdate > 7;
    const isOverdue = opportunity.nextFollowUpDate && isPast(parseISO(opportunity.nextFollowUpDate)) && !isToday(parseISO(opportunity.nextFollowUpDate));

    // Determine card style based on health
    let statusBorderClass = 'border-l-4 border-transparent'; // Default
    if (isJustUpdated) statusBorderClass = 'border-l-4 border-green-500';
    else if (isOverdue) statusBorderClass = 'border-l-4 border-red-500';
    else if (isStale) statusBorderClass = 'border-l-4 border-amber-400';
    else statusBorderClass = 'border-l-4 border-blue-500';

    const dynamicClasses = [
        isDragging ? 'opacity-50 shadow-2xl ring-2 ring-blue-500 scale-105 rotate-2' : 'opacity-100',
        isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed',
        isJustUpdated ? 'scale-105 shadow-lg' : '',
    ].join(' ');

    return (
        <div
            ref={drag}
            className={`p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${statusBorderClass} ${dynamicClasses} relative group border border-slate-100 dark:border-slate-700`}
        >
            {/* Badges */}
            <div className="flex justify-between items-start mb-2">
                {isStale && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        {language === 'el' ? 'ΑΔΡΑΝΕΣ' : 'STALE'} ({daysSinceUpdate}d)
                    </span>
                )}
                {!isStale && !isOverdue && <div />} {/* Spacer */}
                
                {/* Quick Actions Context Menu (Visible on Hover) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button 
                        onClick={generatePitch}
                        className="p-1 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300"
                        title="AI Pitch"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
                    {prospect?.phone && (
                        <a href={`tel:${prospect.phone}`} className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </a>
                    )}
                </div>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white leading-snug pr-2 text-sm">{opportunity.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {prospect ? `${prospect.firstName} ${prospect.lastName}` : '...'}
            </p>
            
            <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Value</span>
                    <span className="font-bold text-base text-slate-800 dark:text-slate-200">€{opportunity.value.toLocaleString()}</span>
                </div>
                
                {opportunity.nextFollowUpDate ? (
                     <div className={`text-xs font-medium px-2 py-1 rounded flex items-center gap-1 ${isOverdue ? 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-200' : 'text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300'}`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{new Date(opportunity.nextFollowUpDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                    </div>
                ) : (
                    <div className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded font-bold uppercase">
                        No Action
                    </div>
                )}
            </div>
            
            {/* Subtle Probability Bar */}
            {probability > 0 && (
                <div className="absolute bottom-0 left-0 h-1 bg-slate-100 dark:bg-slate-700 w-full rounded-b-lg overflow-hidden">
                    <div className={`h-full ${probability > 0.7 ? 'bg-green-500' : probability > 0.3 ? 'bg-blue-500' : 'bg-slate-400'}`} style={{ width: `${probability * 100}%` }}></div>
                </div>
            )}

            {/* AI Pitch Overlay */}
            {showPitch && (
                <div className="absolute inset-0 z-20 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-xl border border-purple-200 dark:border-purple-700 flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                        <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                            <span>✨</span> Smart Pitch
                        </span>
                        <button onClick={closePitch} className="text-slate-400 hover:text-slate-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto mb-3">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                                <span>Drafting message...</span>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed whitespace-pre-wrap font-serif">
                                "{pitchText}"
                            </p>
                        )}
                    </div>
                    {!isGenerating && pitchText && (
                        <button 
                            onClick={copyPitch} 
                            className="w-full py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Copy to Clipboard
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default OpportunityCard;