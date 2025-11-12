import React from 'react';
import { useDrop } from 'react-dnd';
import { OpportunityStage, Opportunity__EXT, Prospect } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import OpportunityCard from './OpportunityCard';

interface PipelineColumnProps {
    stage: OpportunityStage;
    opportunities: Opportunity__EXT[];
    prospects: Prospect[];
    onDrop: (opportunityId: string, newStage: OpportunityStage) => void;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({ stage, opportunities, prospects, onDrop }) => {
    const { t } = useLocalization();

    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: 'opportunity',
        drop: (item: { id: string }) => onDrop(item.id, stage),
        canDrop: () => !['won', 'lost'].includes(stage),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [stage, onDrop]);

    const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);

    return (
        <div 
            ref={drop} 
            className={`w-full md:w-64 lg:w-80 flex-shrink-0 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors duration-300 ${isOver && canDrop ? 'border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/40' : ''}`}
        >
            <h3 className="font-bold text-lg mb-2 capitalize flex justify-between items-center">
                <span>{t(`pipeline.stages.${stage}`)} ({opportunities.length})</span>
                <span className="text-sm font-normal text-gray-500">€{totalValue.toLocaleString()}</span>
            </h3>
            <div className="space-y-3 h-full overflow-y-auto">
                {opportunities.map(opp => {
                    const prospect = prospects.find(p => p.id === opp.prospectId);
                    return (
                        <OpportunityCard 
                            key={opp.id} 
                            opportunity={opp} 
                            prospect={prospect} 
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default PipelineColumn;