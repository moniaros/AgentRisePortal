import { useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchTemplates } from '../services/api';
import { MessageTemplate } from '../types';

export const useTemplates = () => {
    const {
        data: templates,
        isLoading,
        error,
        updateData: setTemplates,
    } = useOfflineSync<MessageTemplate[]>('templates_data', fetchTemplates, []);

    const addTemplate = useCallback((template: Omit<MessageTemplate, 'id'>) => {
        const newTemplate: MessageTemplate = {
            ...template,
            id: `${template.channel}_${Date.now()}`,
        };
        // FIX: The 'updateData' function from useOfflineSync expects the new state value directly, not a function.
        setTemplates([...templates, newTemplate]);
    }, [setTemplates, templates]);

    const updateTemplate = useCallback((updatedTemplate: MessageTemplate) => {
        // FIX: The 'updateData' function from useOfflineSync expects the new state value directly, not a function.
        setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    }, [setTemplates, templates]);
    
    const deleteTemplate = useCallback((templateId: string) => {
        // FIX: The 'updateData' function from useOfflineSync expects the new state value directly, not a function.
        setTemplates(templates.filter(t => t.id !== templateId));
    }, [setTemplates, templates]);

    return {
        templates,
        isLoading,
        error,
        addTemplate,
        updateTemplate,
        deleteTemplate
    };
};
