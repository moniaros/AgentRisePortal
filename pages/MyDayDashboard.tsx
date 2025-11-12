import React, { useMemo } from 'react';
import { usePipelineData } from '../hooks/usePipelineData';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import MyDayList from '../components/pipeline/MyDay/MyDayList';
import { isToday, isPast, parseISO } from 'date-fns';

const MyDayDashboard: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { opportunities, prospects, isLoading, error, updateOpportunityStage } = usePipelineData();

    const agentOpportunities = useMemo(() => {
        if (!currentUser) return [];
        return opportunities.filter(opp => opp.agentId === currentUser.id);
    }, [opportunities, currentUser]);

    const categorizedOpps = useMemo(() => {
        const overdue: typeof agentOpportunities = [];
        const dueToday: typeof agentOpportunities = [];
        const noDueDate: typeof agentOpportunities = [];

        agentOpportunities.forEach(opp => {
            if (opp.stage === 'won' || opp.stage === 'lost') return;

            if (opp.nextFollowUpDate) {
                const followUpDate = parseISO(opp.nextFollowUpDate);
                if (isPast(followUpDate) && !isToday(followUpDate)) {
                    overdue.push(opp);
                } else if (isToday(followUpDate)) {
                    dueToday.push(opp);
                }
            } else {
                noDueDate.push(opp);
            }
        });

        return { overdue, dueToday, noDueDate };
    }, [agentOpportunities]);

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.myDay')}</h1>
            </div>

            {isLoading ? (
                <div className="space-y-8">
                    <SkeletonLoader className="h-48 w-full" />
                    <SkeletonLoader className="h-48 w-full" />
                    <SkeletonLoader className="h-48 w-full" />
                </div>
            ) : (
                <div className="space-y-8">
                    <MyDayList
                        title={t('pipeline.myDay.overdue')}
                        opportunities={categorizedOpps.overdue}
                        prospects={prospects}
                        onUpdateStage={updateOpportunityStage}
                        variant="danger"
                    />
                    <MyDayList
                        title={t('pipeline.myDay.dueToday')}
                        opportunities={categorizedOpps.dueToday}
                        prospects={prospects}
                        onUpdateStage={updateOpportunityStage}
                        variant="info"
                    />
                    <MyDayList
                        title={t('pipeline.myDay.noDueDate')}
                        opportunities={categorizedOpps.noDueDate}
                        prospects={prospects}
                        onUpdateStage={updateOpportunityStage}
                        variant="default"
                    />
                </div>
            )}
        </div>
    );
};

export default MyDayDashboard;
