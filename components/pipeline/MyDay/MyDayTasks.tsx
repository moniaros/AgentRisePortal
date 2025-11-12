import React from 'react';
import { Task } from '../../../types';
import TaskItem from '../../tasks/TaskItem';

interface MyDayTasksProps {
    title: string;
    tasks: Task[];
    onToggleComplete: (taskId: string) => void;
}

const MyDayTasks: React.FC<MyDayTasksProps> = ({ title, tasks, onToggleComplete }) => {
    
    if (tasks.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <h2 className="text-xl font-semibold mb-4">{title} ({tasks.length})</h2>
            <div className="space-y-2">
                {tasks.map(task => (
                    <div key={task.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                       <TaskItem task={task} onToggleComplete={onToggleComplete} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyDayTasks;