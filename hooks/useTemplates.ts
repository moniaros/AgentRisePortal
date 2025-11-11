
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
        setTemplates([...templates, newTemplate]);
    }, [setTemplates, templates]);

    const updateTemplate = useCallback((updatedTemplate: MessageTemplate) => {
        setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    }, [setTemplates, templates]);
    
    const deleteTemplate = useCallback((templateId: string) => {
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
