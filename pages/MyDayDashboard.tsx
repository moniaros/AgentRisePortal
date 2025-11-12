import React, { useMemo } from 'react';
import { usePipelineData } from '../hooks/usePipelineData';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import MyDayList from '../components/pipeline/MyDay/MyDayList';
import MyDayTasks from '../components/pipeline/MyDay/MyDayTasks';
import { isToday, isPast, parseISO } from 'date-fns';
import { useTasks } from '../hooks/useTasks';

const MyDayDashboard: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { opportunities, prospects, isLoading: isLoadingOpps, error: errorOpps, updateOpportunityStage } = usePipelineData();
    const { tasks, isLoading: isLoadingTasks, error: errorTasks, toggleTaskCompletion } = useTasks();

    const agentOpportunities = useMemo(() => {
        if (!currentUser) return [];
        return opportunities.filter(opp => opp.agentId === currentUser.id);
    }, [opportunities, currentUser]);

    const agentTasks = useMemo(() => {
        if (!currentUser) return [];
        return tasks.filter(task => task.agentId === currentUser.id && !task.isCompleted);
    }, [tasks, currentUser]);

    const categorizedOpps = useMemo(() => {
        const overdue: typeof agentOpportunities = [];
        const dueToday: typeof agentOpportunities = [];
        const noDueDate: typeof agentOpportunities = [];

        agentOpportunities.forEach(opp => {
            if (opp.stage === 'won' || opp.stage === 'lost') return;

            if (opp.nextFollowUpDate) {
                try {
                    const followUpDate = parseISO(opp.nextFollowUpDate);
                    if (isPast(followUpDate) && !isToday(followUpDate)) {
                        overdue.push(opp);
                    } else if (isToday(followUpDate)) {
                        dueToday.push(opp);
                    }
                } catch (e) {
                    console.error("Invalid date for opportunity:", opp.id, opp.nextFollowUpDate);
                }
            } else {
                noDueDate.push(opp);
            }
        });

        return { overdue, dueToday, noDueDate };
    }, [agentOpportunities]);

    const tasksForToday = useMemo(() => {
        return agentTasks.filter(task => {
            if (!task.dueDate) return false;
            try {
                const dueDate = parseISO(task.dueDate);
                return isToday(dueDate) || isPast(dueDate);
            } catch(e) {
                 console.error("Invalid date for task:", task.id, task.dueDate);
                 return false;
            }
        });
    }, [agentTasks]);
    
    const isLoading = isLoadingOpps || isLoadingTasks;
    const error = errorOpps || errorTasks;

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
                    <MyDayTasks
                        title={t('pipeline.myDay.tasksToday')}
                        tasks={tasksForToday}
                        onToggleComplete={toggleTaskCompletion}
                    />
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