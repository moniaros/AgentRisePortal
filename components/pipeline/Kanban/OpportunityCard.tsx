
import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Opportunity__EXT, Prospect } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { isPast, isToday, parseISO, differenceInDays } from 'date-fns';
import { usePrevious } from '../../../hooks/usePrevious';

interface OpportunityCardProps {
    opportunity: Opportunity__EXT;
    prospect?: Prospect;
    probability?: number;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, prospect, probability = 0 }) => {
    const { t, language } = useLocalization();
    const [isJustUpdated, setIsJustUpdated] = useState(false);
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
                {prospect?.phone && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`tel:${prospect.phone}`} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OpportunityCard;
