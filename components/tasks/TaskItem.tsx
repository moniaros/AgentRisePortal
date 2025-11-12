import React from 'react';
import { Task } from '../../types';
import { isPast, isToday, parseISO } from 'date-fns';

interface TaskItemProps {
    task: Task;
    onToggleComplete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete }) => {
    const isOverdue = task.dueDate && !task.isCompleted && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));

    return (
        <div className={`p-4 flex items-center gap-4 transition-colors ${task.isCompleted ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
            <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => onToggleComplete(task.id)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                aria-label={`Mark task '${task.title}' as ${task.isCompleted ? 'incomplete' : 'complete'}`}
            />
            <div className="flex-grow">
                <p className={`text-sm font-medium ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                </p>
                 {task.dueDate && (
                    <p className={`text-xs mt-1 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
};

export default TaskItem;