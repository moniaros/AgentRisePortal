import React from 'react';
import { Task } from '../../types';
import TaskItem from './TaskItem';
import { useLocalization } from '../../hooks/useLocalization';

interface TaskListProps {
    tasks: Task[];
    onToggleComplete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete }) => {
    const { t } = useLocalization();
    
    if (tasks.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500">{t(tasks.some(t => t.isCompleted) ? 'tasks.noCompletedTasks' : 'tasks.noTasks')}</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md divide-y dark:divide-gray-700">
            {tasks.map(task => (
                <TaskItem key={task.id} task={task} onToggleComplete={onToggleComplete} />
            ))}
        </div>
    );
};

export default TaskList;