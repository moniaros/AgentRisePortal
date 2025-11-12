import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Opportunity__EXT, Prospect } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { isPast, isToday, parseISO } from 'date-fns';
import { usePrevious } from '../../../hooks/usePrevious';

interface OpportunityCardProps {
    opportunity: Opportunity__EXT;
    prospect?: Prospect;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, prospect }) => {
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
            <h4 className="font-bold">{opportunity.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {prospect ? `${prospect.firstName} ${prospect.lastName}` : '...'}
            </p>
            <p className="font-semibold text-lg my-2">€{opportunity.value.toLocaleString()}</p>
            {opportunity.nextFollowUpDate && (
                 <p className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isOverdue && <span className="font-bold">({t('pipeline.overdue')}) </span>}
                    Follow-up: {new Date(opportunity.nextFollowUpDate).toLocaleDateString()}
                </p>
            )}
        </div>
    );
};

export default OpportunityCard;