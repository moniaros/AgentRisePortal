
import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Opportunity__EXT, Prospect } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { isPast, isToday, parseISO } from 'date-fns';
import { usePrevious } from '../../../hooks/usePrevious';

interface OpportunityCardProps {
    opportunity: Opportunity__EXT;
    prospect?: Prospect;
    probability?: number;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, prospect, probability = 0 }) => {
    const { t } = useLocalization();
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
            const timer = setTimeout(() => setIsJustUpdated(false), 2000); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [opportunity.updatedAt, prevUpdatedAt, isDragging]);

    const isOverdue = opportunity.nextFollowUpDate && isPast(parseISO(opportunity.nextFollowUpDate)) && !isToday(parseISO(opportunity.nextFollowUpDate));

    const borderColor = isJustUpdated
        ? 'border-green-500'
        : isOverdue
        ? 'border-red-500'
        : 'border-blue-500';

    const dynamicClasses = [
        isDragging ? 'opacity-50 shadow-2xl ring-2 ring-blue-500 scale-105' : 'opacity-100',
        isDraggable ? 'cursor-grab' : 'cursor-not-allowed',
        isJustUpdated ? 'scale-105 shadow-lg' : '',
    ].join(' ');

    return (
        <div
            ref={drag}
            className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 transition-all duration-300 ${borderColor} ${dynamicClasses}`}
        >
            <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{opportunity.title}</h4>
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

            {opportunity.nextFollowUpDate && (
                 <div className={`text-xs font-medium p-1.5 rounded bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2 ${isOverdue ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span>📅</span>
                    {isOverdue && <span className="font-bold uppercase">Overdue</span>}
                    <span>{new Date(opportunity.nextFollowUpDate).toLocaleDateString()}</span>
                </div>
            )}
        </div>
    );
};

export default OpportunityCard;
