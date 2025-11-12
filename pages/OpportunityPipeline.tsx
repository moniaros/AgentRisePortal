import React, { useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { usePipelineData } from '../hooks/usePipelineData';
import { useLocalization } from '../hooks/useLocalization';
import { OpportunityStage, Opportunity__EXT } from '../types';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import PipelineColumn from '../components/pipeline/Kanban/PipelineColumn';
import KpiBar from '../components/pipeline/KpiBar';
import { backendForDND } from '../utils/dndBackends';

const STAGES: OpportunityStage[] = ['new', 'contacted', 'proposal', 'won', 'lost'];

const OpportunityPipeline: React.FC = () => {
    const { t } = useLocalization();
    const { opportunities, prospects, isLoading, error, updateOpportunityStage, inquiries, conversions } = usePipelineData();

    const opportunitiesByStage = useMemo(() => {
        const grouped: Record<OpportunityStage, Opportunity__EXT[]> = {
            new: [], contacted: [], proposal: [], won: [], lost: []
        };
        opportunities.forEach(opp => {
            if (grouped[opp.stage]) {
                grouped[opp.stage].push(opp);
            }
        });
        return grouped;
    }, [opportunities]);

    const handleDrop = (opportunityId: string, newStage: OpportunityStage) => {
        updateOpportunityStage(opportunityId, newStage);
    };

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <DndProvider backend={backendForDND}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('pipeline.title')}</h1>
                </div>
                
                {isLoading ? <SkeletonLoader className="h-24 w-full" /> : 
                    <KpiBar 
                        opportunities={opportunities} 
                        inquiries={inquiries}
                        conversions={conversions}
                    />
                }

                <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
                    {isLoading ? (
                        STAGES.map(stage => (
                            <div key={stage} className="w-full md:w-64 lg:w-80 flex-shrink-0">
                                <SkeletonLoader className="h-10 w-full mb-4" />
                                <SkeletonLoader className="h-32 w-full mb-2" />
                                <SkeletonLoader className="h-32 w-full" />
                            </div>
                        ))
                    ) : (
                        STAGES.map(stage => (
                            <PipelineColumn
                                key={stage}
                                stage={stage}
                                opportunities={opportunitiesByStage[stage]}
                                prospects={prospects}
                                onDrop={handleDrop}
                            />
                        ))
                    )}
                </div>
            </div>
        </DndProvider>
    );
};

export default OpportunityPipeline;