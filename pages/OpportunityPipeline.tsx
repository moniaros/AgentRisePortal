import React, { useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { usePipelineData } from '../hooks/usePipelineData';
import { useLocalization } from '../hooks/useLocalization';
import { OpportunityStage, Opportunity__EXT } from '../types';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import PipelineColumn from '../components/pipeline/Kanban/PipelineColumn';
import KpiBar from '../components/pipeline/KpiBar';
import OpportunityDetailModal from '../components/pipeline/OpportunityDetailModal';
import { backendForDND } from '../utils/dndBackends';

const STAGES: OpportunityStage[] = ['new', 'contacted', 'proposal', 'won', 'lost'];

const OpportunityPipeline: React.FC = () => {
    const { t } = useLocalization();
    const {
        opportunities,
        prospects,
        inquiries,
        interactions,
        isLoading,
        error,
        createOpportunity,
        updateOpportunity,
        updateOpportunityStage,
        bindOpportunityToCustomer,
        addInteraction,
        conversions,
    } = usePipelineData();

    const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOpportunities = useMemo(() => {
        if (!searchQuery.trim()) return opportunities;
        const q = searchQuery.toLowerCase();
        return opportunities.filter((opp) => {
            const p = prospects.find((pr) => pr.id === opp.prospectId);
            return (
                opp.title.toLowerCase().includes(q) ||
                `${p?.firstName || ''} ${p?.lastName || ''}`.toLowerCase().includes(q)
            );
        });
    }, [opportunities, prospects, searchQuery]);

    const opportunitiesByStage = useMemo(() => {
        const grouped: Record<OpportunityStage, Opportunity__EXT[]> = {
            new: [],
            contacted: [],
            proposal: [],
            won: [],
            lost: [],
        };
        filteredOpportunities.forEach((opp) => {
            if (grouped[opp.stage]) {
                grouped[opp.stage].push(opp);
            }
        });
        return grouped;
    }, [filteredOpportunities]);

    const selectedOpportunity = useMemo(
        () => opportunities.find((o) => o.id === selectedOppId) || null,
        [opportunities, selectedOppId]
    );

    const selectedProspect = useMemo(
        () =>
            selectedOpportunity
                ? prospects.find((p) => p.id === selectedOpportunity.prospectId) || null
                : null,
        [selectedOpportunity, prospects]
    );

    const selectedInteractions = useMemo(
        () =>
            selectedOpportunity
                ? interactions.filter((i) => i.opportunityId === selectedOpportunity.id)
                : [],
        [selectedOpportunity, interactions]
    );

    const handleQuickCreateDeal = () => {
        const created = createOpportunity(
            {
                id: `inq_manual_${Date.now()}`,
                agencyId: 'agency_1',
                createdAt: new Date().toISOString(),
                contact: {
                    firstName: 'Nikos',
                    lastName: 'Georgiou',
                    email: 'n.georgiou@example.com',
                    phone: '6974455667',
                },
                consentGDPR: true,
                source: 'Direct Walk-In',
                purpose: 'quote_request',
                policyType: 'home',
                details: 'Walk-in quote for Home & ENFIA -20% bundle.',
                attribution: {},
                attributionId: `manual_${Date.now()}`,
            },
            380
        );
        if (created) {
            setSelectedOppId(created.id);
        }
    };

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <DndProvider backend={backendForDND}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pipeline.title')}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Click any deal card to compare 6 live carrier tariffs and bind policies in one click.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="search"
                            aria-label="Filter pipeline deals"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter deals or clients..."
                            className="px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 dark:text-white"
                        />
                        <button
                            type="button"
                            onClick={handleQuickCreateDeal}
                            className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg whitespace-nowrap"
                        >
                            + New Quote &amp; Deal
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <SkeletonLoader className="h-24 w-full" />
                ) : (
                    <KpiBar opportunities={opportunities} inquiries={inquiries} conversions={conversions} />
                )}

                <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
                    {isLoading
                        ? STAGES.map((stage) => (
                              <div key={stage} className="w-full md:w-64 lg:w-76 flex-shrink-0">
                                  <SkeletonLoader className="h-10 w-full mb-4" />
                                  <SkeletonLoader className="h-32 w-full mb-2" />
                                  <SkeletonLoader className="h-32 w-full" />
                              </div>
                          ))
                        : STAGES.map((stage) => (
                              <PipelineColumn
                                  key={stage}
                                  stage={stage}
                                  opportunities={opportunitiesByStage[stage]}
                                  prospects={prospects}
                                  inquiries={inquiries}
                                  onDrop={updateOpportunityStage}
                                  onSelectOpportunity={(opp) => setSelectedOppId(opp.id)}
                              />
                          ))}
                </div>

                <OpportunityDetailModal
                    isOpen={Boolean(selectedOpportunity)}
                    onClose={() => setSelectedOppId(null)}
                    opportunity={selectedOpportunity}
                    prospect={selectedProspect}
                    interactions={selectedInteractions}
                    onUpdateOpportunity={updateOpportunity}
                    onAddInteraction={addInteraction}
                    onBindPolicy={bindOpportunityToCustomer}
                />
            </div>
        </DndProvider>
    );
};

export default OpportunityPipeline;