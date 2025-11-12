import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import TaskList from '../components/tasks/TaskList';
import TaskModal from '../components/tasks/TaskModal';

type TaskFilter = 'all' | 'incomplete' | 'completed';

const Tasks: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { tasks, isLoading, error, addTask, toggleTaskCompletion } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<TaskFilter>('incomplete');

    const agentTasks = useMemo(() => {
        return tasks.filter(task => task.agentId === currentUser?.id);
    }, [tasks, currentUser]);

    const filteredTasks = useMemo(() => {
        const sorted = agentTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (filter === 'all') return sorted;
        if (filter === 'completed') return sorted.filter(t => t.isCompleted);
        return sorted.filter(t => !t.isCompleted);
    }, [agentTasks, filter]);

    const incompleteTasks = useMemo(() => agentTasks.filter(t => !t.isCompleted), [agentTasks]);
    const completedTasks = useMemo(() => agentTasks.filter(t => t.isCompleted), [agentTasks]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('tasks.title')}</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    {t('tasks.addTask')}
                </button>
            </div>

            {error && <ErrorMessage message={error.message} />}

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                 <div className="flex space-x-1 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                    {(['incomplete', 'completed', 'all'] as TaskFilter[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`w-full rounded-md py-2 text-sm font-medium transition ${filter === f ? 'bg-white dark:bg-gray-800 shadow text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50'}`}
                        >
                            {t(`tasks.filters.${f}`)}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? <SkeletonLoader className="h-96 w-full" /> : (
                <div className="space-y-8">
                    {filter !== 'completed' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">{t('tasks.sections.todo')} ({incompleteTasks.length})</h2>
                            <TaskList tasks={incompleteTasks} onToggleComplete={toggleTaskCompletion} />
                        </div>
                    )}
                    
                    {filter !== 'incomplete' && (
                         <div>
                            <h2 className="text-xl font-semibold mb-4">{t('tasks.sections.completed')} ({completedTasks.length})</h2>
                            <TaskList tasks={completedTasks} onToggleComplete={toggleTaskCompletion} />
                        </div>
                    )}
                </div>
            )}
            
            <TaskModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={addTask}
            />
        </div>
    );
};

export default Tasks;