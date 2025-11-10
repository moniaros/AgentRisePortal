import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { AutomatedTask } from '../../types';
import SkeletonLoader from '../ui/SkeletonLoader';

interface AutomatedTasksWidgetProps {
    tasks: AutomatedTask[];
    isLoading: boolean;
}

const AutomatedTasksWidget: React.FC<AutomatedTasksWidgetProps> = ({ tasks, isLoading }) => {
    const { t, language } = useLocalization();

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <SkeletonLoader key={i} className="h-12 w-full" />)}
                </div>
            );
        }

        if (tasks.length === 0) {
            return <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No automated tasks or reminders today.</p>;
        }

        return (
            <ul className="space-y-3">
                {tasks.map(task => (
                    <li key={task.id} className="p-3 rounded-md bg-gray-50 dark:bg-gray-700/50 flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-300">
                           🔔
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm text-gray-800 dark:text-gray-200">{task.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(task.createdAt).toLocaleDateString(language, { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' })}</p>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t('dashboard.automatedTasks')}
            </h2>
            <div className="overflow-y-auto max-h-80 pr-2">
                {renderContent()}
            </div>
        </div>
    );
};

export default AutomatedTasksWidget;
