import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Opportunity__EXT, Prospect, TransactionInquiry } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { isPast, isToday, parseISO, differenceInDays } from 'date-fns';
import { usePrevious } from '../../../hooks/usePrevious';
import { generateGeminiContent } from '../../../services/geminiClient';

interface OpportunityCardProps {
    opportunity: Opportunity__EXT;
    prospect?: Prospect;
    inquiry?: TransactionInquiry;
    probability?: number;
    onSelect?: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
    opportunity,
    prospect,
    inquiry,
    probability = 0,
    onSelect,
}) => {
    const { language } = useLocalization();
    const [isJustUpdated, setIsJustUpdated] = useState(false);
    const [showPitch, setShowPitch] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [pitchText, setPitchText] = useState('');

    const prevUpdatedAt = usePrevious(opportunity.updatedAt);
    const isDraggable = !['won', 'lost'].includes(opportunity.stage);

    const [{ isDragging }, drag] = useDrag(
        () => ({
            type: 'opportunity',
            item: { id: opportunity.id },
            canDrag: isDraggable,
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [opportunity.id, isDraggable]
    );

    useEffect(() => {
        if (prevUpdatedAt && opportunity.updatedAt !== prevUpdatedAt && !isDragging) {
            setIsJustUpdated(true);
            const timer = setTimeout(() => setIsJustUpdated(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [opportunity.updatedAt, prevUpdatedAt, isDragging]);

    const generatePitch = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowPitch(true);
        if (pitchText) return;

        setIsGenerating(true);
        try {
            const targetLang = language === 'el' ? 'Greek' : 'English';
            const prompt = `Act as a senior insurance advisor. Write a short, warm message (SMS/WhatsApp) to ${
                prospect?.firstName || 'Client'
            } regarding ${inquiry?.policyType || opportunity.title}. Language: ${targetLang} ONLY. Max 40 words.`;
            const text = await generateGeminiContent({ contents: prompt });
            setPitchText(text.trim() || 'Could not generate pitch.');
        } catch {
            setPitchText('Error generating pitch.');
        } finally {
            setIsGenerating(false);
        }
    };

    const daysSinceUpdate = differenceInDays(new Date(), new Date(opportunity.updatedAt));
    const isStale = daysSinceUpdate > 7;
    const isOverdue =
        opportunity.nextFollowUpDate &&
        isPast(parseISO(opportunity.nextFollowUpDate)) &&
        !isToday(parseISO(opportunity.nextFollowUpDate));

    return (
        <div
            ref={(node) => {
                drag(node);
            }}
            onClick={onSelect}
            className={`p-3.5 bg-white dark:bg-slate-900 rounded-lg border transition-all duration-150 relative group ${
                isJustUpdated
                    ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                    : isOverdue
                      ? 'border-red-300 dark:border-red-800'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
            } ${isDragging ? 'opacity-50' : 'opacity-100'} cursor-pointer`}
        >
            <div className="flex justify-between items-center mb-1.5 text-xs text-slate-500">
                <span>
                    {isOverdue
                        ? language === 'el'
                            ? 'Εκπρόθεσμο'
                            : 'Overdue'
                        : isStale
                          ? `${language === 'el' ? 'Αδρανές' : 'Idle'} · ${daysSinceUpdate}d`
                          : prospect
                            ? `${prospect.firstName} ${prospect.lastName}`
                            : 'Deal'}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={generatePitch}
                        aria-label={`Smart pitch for ${opportunity.title}`}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                        title="AI Smart Pitch"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.();
                }}
                className="text-left w-full font-semibold text-slate-900 dark:text-white leading-snug text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
                {opportunity.title}
            </button>

            <div className="flex justify-between items-end mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tabular-nums">
                    €{opportunity.value.toLocaleString()}
                </span>
                <span className={`text-xs tabular-nums ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                    {opportunity.nextFollowUpDate
                        ? new Date(opportunity.nextFollowUpDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                          })
                        : 'Quote & Bind →'}
                </span>
            </div>

            {probability > 0 && (
                <div className="mt-2 h-0.5 bg-slate-100 dark:bg-slate-800 w-full rounded-full overflow-hidden">
                    <div
                        className={`h-full ${probability >= 1 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${probability * 100}%` }}
                    />
                </div>
            )}

            {showPitch && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 z-20 bg-white dark:bg-slate-900 rounded-lg p-3.5 shadow-xl border border-blue-300 dark:border-blue-700 flex flex-col"
                >
                    <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Advisor Pitch</span>
                        <button
                            type="button"
                            aria-label="Close smart pitch"
                            onClick={() => setShowPitch(false)}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            &times;
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
                        {isGenerating ? 'Drafting...' : pitchText}
                    </div>
                    {!isGenerating && pitchText && (
                        <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(pitchText)}
                            className="mt-2 w-full py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-xs font-semibold"
                        >
                            Copy Text
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default OpportunityCard;