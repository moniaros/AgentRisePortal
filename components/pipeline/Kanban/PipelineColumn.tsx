import React from 'react';
import { useDrop } from 'react-dnd';
import { OpportunityStage, Opportunity__EXT, Prospect, TransactionInquiry } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import OpportunityCard from './OpportunityCard';

interface PipelineColumnProps {
    stage: OpportunityStage;
    opportunities: Opportunity__EXT[];
    prospects: Prospect[];
    inquiries: TransactionInquiry[];
    onDrop: (opportunityId: string, newStage: OpportunityStage) => void;
    onSelectOpportunity: (opportunity: Opportunity__EXT) => void;
}

const STAGE_PROBABILITY: Record<OpportunityStage, number> = {
    new: 0.1,
    contacted: 0.3,
    proposal: 0.6,
    won: 1.0,
    lost: 0.0,
};

const PipelineColumn: React.FC<PipelineColumnProps> = ({
    stage,
    opportunities,
    prospects,
    inquiries,
    onDrop,
    onSelectOpportunity,
}) => {
    const { t } = useLocalization();

    const [{ isOver, canDrop }, drop] = useDrop(
        () => ({
            accept: 'opportunity',
            drop: (item: { id: string }) => onDrop(item.id, stage),
            canDrop: () => true,
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        [stage, onDrop]
    );

    const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
    const weightedValue = Math.round(totalValue * STAGE_PROBABILITY[stage]);

    return (
        <div
            ref={(node) => {
                drop(node);
            }}
            className={`w-full md:w-64 lg:w-76 flex-shrink-0 p-3.5 bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors duration-200 ${
                isOver && canDrop ? 'ring-2 ring-blue-500 bg-blue-50/60 dark:bg-blue-950/30' : ''
            }`}
        >
            <div className="mb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white capitalize flex justify-between items-center">
                    <span>{t(`pipeline.stages.${stage}`)}</span>
                    <span className="text-slate-500 text-xs font-mono tabular-nums">{opportunities.length}</span>
                </h3>
                <div className="flex justify-between items-end mt-1.5">
                    <div>
                        <p className="text-[11px] text-slate-500">Total</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                            €{totalValue.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] text-slate-500">Weighted</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            €{weightedValue.toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${STAGE_PROBABILITY[stage] * 100}%` }} />
                </div>
            </div>

            <div className="space-y-2.5 min-h-[220px]">
                {opportunities.map((opp) => {
                    const prospect = prospects.find((p) => p.id === opp.prospectId);
                    const inquiry = inquiries.find((i) => i.id === opp.inquiryId);
                    return (
                        <OpportunityCard
                            key={opp.id}
                            opportunity={opp}
                            prospect={prospect}
                            inquiry={inquiry}
                            probability={STAGE_PROBABILITY[stage]}
                            onSelect={() => onSelectOpportunity(opp)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default PipelineColumn;