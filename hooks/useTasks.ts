import { useMemo, useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchTasks } from '../services/api';
import { Task } from '../types';
import { useAuth } from './useAuth';

export const useTasks = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;
    const agentId = currentUser?.id;

    const {
        data: allTasks,
        isLoading,
        error,
        updateData: setAllTasks,
    } = useOfflineSync<Task[]>('tasks_data', fetchTasks, []);

    const tasks = useMemo(() => {
        return allTasks.filter(task => task.agencyId === agencyId);
    }, [allTasks, agencyId]);
    
    const addTask = useCallback((taskData: Omit<Task, 'id' | 'agencyId' | 'agentId' | 'createdAt' | 'isCompleted' | 'completedAt'>) => {
        if (!agencyId || !agentId) return;
        const newTask: Task = {
            ...taskData,
            id: `task_${Date.now()}`,
            agencyId,
            agentId,
            createdAt: new Date().toISOString(),
            isCompleted: false,
            completedAt: null,
        };
        setAllTasks([...allTasks, newTask]);
    }, [allTasks, setAllTasks, agencyId, agentId]);
    
    const updateTask = useCallback((updatedTask: Task) => {
        setAllTasks(allTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    }, [allTasks, setAllTasks]);

    const toggleTaskCompletion = useCallback((taskId: string) => {
        const taskToToggle = allTasks.find(t => t.id === taskId);
        if (taskToToggle) {
            const updatedTask = {
                ...taskToToggle,
                isCompleted: !taskToToggle.isCompleted,
                completedAt: !taskToToggle.isCompleted ? new Date().toISOString() : null,
            };
            updateTask(updatedTask);
        }
    }, [allTasks, updateTask]);

    const deleteTask = useCallback((taskId: string) => {
        setAllTasks(allTasks.filter(task => task.id !== taskId));
    }, [allTasks, setAllTasks]);

    return {
        tasks,
        isLoading,
        error,
        addTask,
        updateTask,
        toggleTaskCompletion,
        deleteTask,
    };
};