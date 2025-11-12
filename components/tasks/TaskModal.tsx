import React from 'react';
import { useForm } from 'react-hook-form';
import { useLocalization } from '../../hooks/useLocalization';
import { Task } from '../../types';

type TaskFormData = Omit<Task, 'id' | 'agencyId' | 'agentId' | 'createdAt' | 'isCompleted' | 'completedAt'>;

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: TaskFormData) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave }) => {
    const { t } = useLocalization();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>();

    const handleSave = (data: TaskFormData) => {
        onSave(data);
        reset({ title: '', dueDate: null });
        onClose();
    };
    
    const handleClose = () => {
        reset({ title: '', dueDate: null });
        onClose();
    }

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit(handleSave)} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{t('tasks.addTaskTitle')}</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium">{t('tasks.taskTitle')}</label>
                        <input
                            id="title"
                            type="text"
                            {...register('title', { required: t('validation.required', { fieldName: t('tasks.taskTitle')}) as string })}
                            placeholder={t('tasks.taskTitlePlaceholder')}
                            className={`mt-1 w-full p-2 border rounded dark:bg-gray-700 ${errors.title ? 'border-red-500' : 'dark:border-gray-600'}`}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>
                     <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium">{t('tasks.dueDate')}</label>
                        <input
                            id="dueDate"
                            type="date"
                            {...register('dueDate')}
                            className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
                    <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                        {t('common.cancel')}
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('common.save')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskModal;