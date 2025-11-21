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
import { useAllKpiSnapshotsData } from '../hooks/useAllKpiSnapshotsData';

const MyDayDashboard: React.FC = () => {
    const { t, language } = useLocalization();
    const { currentUser } = useAuth();
    const { opportunities, prospects, isLoading: isLoadingOpps, error: errorOpps, updateOpportunityStage } = usePipelineData();
    const { tasks, isLoading: isLoadingTasks, error: errorTasks, toggleTaskCompletion } = useTasks();
    const { allKpiSnapshots } = useAllKpiSnapshotsData();

    // Mock Monthly Quota - In a real app, this comes from User Settings
    const MONTHLY_QUOTA = 15000; 

    const salesPerformance = useMemo(() => {
        // Calculate total won amount for the current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // In a real app, we'd sum up the actual 'conversions' or 'won opportunities' with timestamps
        // For this mock, we'll grab from KPI snapshots that match this month
        const thisMonthKpis = allKpiSnapshots.filter(k => {
            const d = new Date(k.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const achieved = thisMonthKpis.reduce((sum, k) => sum + k.won.gwp, 0);
        const percentage = Math.min((achieved / MONTHLY_QUOTA) * 100, 100);
        
        return { achieved, percentage };
    }, [allKpiSnapshots]);

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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.myDay')}</h1>
                <div className="text-sm text-gray-500">
                    {new Date().toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-8">
                    <SkeletonLoader className="h-48 w-full" />
                    <SkeletonLoader className="h-48 w-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Performance & Targets */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Sales Target Widget */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                            <h2 className="text-lg font-bold mb-4 opacity-90">
                                {language === 'el' ? 'Στόχος Μήνα' : 'Monthly Target'}
                            </h2>
                            <div className="flex items-center justify-center mb-4">
                                <div className="relative w-32 h-32">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-blue-900/50" />
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white transition-all duration-1000" strokeDasharray={351} strokeDashoffset={351 - (351 * salesPerformance.percentage) / 100} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold">{salesPerformance.percentage.toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm font-medium opacity-90">
                                <span>€{salesPerformance.achieved.toLocaleString()}</span>
                                <span>€{MONTHLY_QUOTA.toLocaleString()}</span>
                            </div>
                            <div className="mt-4 text-xs text-center text-blue-200 bg-blue-900/30 py-2 rounded">
                                {salesPerformance.percentage < 50 
                                    ? (language === 'el' ? 'Πάμε δυνατά! Έχεις δρόμο ακόμα.' : 'Keep pushing! Long way to go.')
                                    : (language === 'el' ? 'Εξαιρετική δουλειά! Πλησιάζεις.' : 'Great job! You are closing in.')}
                            </div>
                        </div>

                        <MyDayTasks
                            title={t('pipeline.myDay.tasksToday')}
                            tasks={tasksForToday}
                            onToggleComplete={toggleTaskCompletion}
                        />
                    </div>

                    {/* Right Column: Pipelines */}
                    <div className="lg:col-span-2 space-y-6">
                        {categorizedOpps.overdue.length > 0 && (
                            <MyDayList
                                title={t('pipeline.myDay.overdue')}
                                opportunities={categorizedOpps.overdue}
                                prospects={prospects}
                                onUpdateStage={updateOpportunityStage}
                                variant="danger"
                            />
                        )}
                        
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
                </div>
            )}
        </div>
    );
};

export default MyDayDashboard;