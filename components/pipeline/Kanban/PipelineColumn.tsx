
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

const STAGE_PROBABILITY: Record<OpportunityStage, number> = {
    new: 0.10,
    contacted: 0.30,
    proposal: 0.60,
    won: 1.0,
    lost: 0.0
};

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
    const weightedValue = totalValue * STAGE_PROBABILITY[stage];

    return (
        <div 
            ref={drop} 
            className={`w-full md:w-64 lg:w-80 flex-shrink-0 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors duration-300 ${isOver && canDrop ? 'border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/40' : ''}`}
        >
            <div className="mb-3">
                <h3 className="font-bold text-lg capitalize flex justify-between items-center">
                    <span>{t(`pipeline.stages.${stage}`)} <span className="text-gray-400 text-sm">({opportunities.length})</span></span>
                </h3>
                <div className="flex justify-between items-end mt-1">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                        <p className="text-sm font-bold">€{totalValue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Forecast</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">€{weightedValue.toLocaleString()}</p>
                    </div>
                </div>
                {/* Probability Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${STAGE_PROBABILITY[stage] * 100}%` }}></div>
                </div>
            </div>

            <div className="space-y-3 h-full overflow-y-auto min-h-[200px]">
                {opportunities.map(opp => {
                    const prospect = prospects.find(p => p.id === opp.prospectId);
                    return (
                        <OpportunityCard 
                            key={opp.id} 
                            opportunity={opp} 
                            prospect={prospect}
                            probability={STAGE_PROBABILITY[stage]}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default PipelineColumn;
