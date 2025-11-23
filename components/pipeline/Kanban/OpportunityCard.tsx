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

    const borderColor = isJustUpdated
        ? 'border-green-500'
        : isOverdue
        ? 'border-red-500'
        : isStale 
        ? 'border-gray-400'
        : 'border-blue-500';

    const dynamicClasses = [
        isDragging ? 'opacity-50 shadow-2xl ring-2 ring-blue-500 scale-105' : 'opacity-100',
        isDraggable ? 'cursor-grab' : 'cursor-not-allowed',
        isJustUpdated ? 'scale-105 shadow-lg' : '',
    ].join(' ');

    return (
        <div
            ref={drag}
            className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border-l-4 transition-all duration-300 ${borderColor} ${dynamicClasses} relative group`}
        >
            {/* Deal Health Badge */}
            {isStale && (
                <div className="absolute top-2 right-2 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    {language === 'el' ? 'ΑΔΡΑΝΕΣ' : 'STALE'} ({daysSinceUpdate}d)
                </div>
            )}

            <h4 className="font-bold text-gray-900 dark:text-white leading-tight pr-12">{opportunity.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {prospect ? `${prospect.firstName} ${prospect.lastName}` : '...'}
            </p>
            
            <div className="flex justify-between items-center my-3">
                <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">€{opportunity.value.toLocaleString()}</p>
                {probability > 0 && (
                    <div className="flex items-center gap-1" title={`Deal Probability: ${(probability * 100).toFixed(0)}%`}>
                        <div className="w-10 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${probability > 0.5 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${probability * 100}%` }}></div>
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">{(probability * 100).toFixed(0)}%</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
                {opportunity.nextFollowUpDate ? (
                     <div className={`text-xs font-medium p-1.5 rounded bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2 ${isOverdue ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 dark:text-gray-400'}`}>
                        <span>📅</span>
                        {isOverdue && <span className="font-bold uppercase">Overdue</span>}
                        <span>{new Date(opportunity.nextFollowUpDate).toLocaleDateString()}</span>
                    </div>
                ) : (
                    <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded font-medium">
                        ⚠️ {language === 'el' ? 'Ορίστε επόμενο βήμα' : 'No Next Step'}
                    </div>
                )}
                
                {/* Quick Action Context */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* AI Pitch Button */}
                    <button 
                        onClick={generatePitch}
                        className="p-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 relative"
                        title="AI Pitch"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
                    {prospect?.phone && (
                        <a href={`tel:${prospect.phone}`} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </a>
                    )}
                </div>
            </div>

            {/* AI Pitch Overlay */}
            {showPitch && (
                <div className="absolute inset-0 z-10 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-xl border border-purple-200 dark:border-purple-800 flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">
                        <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                            <span>✨</span> AI Pitch
                        </span>
                        <button onClick={closePitch} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto mb-2">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs gap-1">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                                <span>Writing...</span>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed whitespace-pre-wrap">
                                "{pitchText}"
                            </p>
                        )}
                    </div>
                    {!isGenerating && pitchText && (
                        <button 
                            onClick={copyPitch} 
                            className="w-full py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            Copy
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default OpportunityCard;