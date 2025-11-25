
import { useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchMicrositeTemplates, toggleMicrositeTemplateFavorite } from '../services/api';
import { MicrositeTemplate } from '../types';
import { useAuth } from './useAuth';

export const useMicrositeTemplates = () => {
    const { currentUser } = useAuth();

    const {
        data: templates,
        isLoading,
        error,
        refresh
    } = useOfflineSync<MicrositeTemplate[]>('microsite_templates_data', fetchMicrositeTemplates, []);

    const toggleFavorite = useCallback(async (templateId: string) => {
        if (!currentUser) return;
        
        try {
            await toggleMicrositeTemplateFavorite(currentUser.id, templateId);
            // In a real app, we might optimistically update or refetch user profile
            // For this mock, we rely on the component to handle the user state update if needed
            // But we can also just refresh templates if they carried the favorite state (which they don't, user does)
        } catch (err) {
            console.error("Failed to toggle favorite", err);
        }
    }, [currentUser]);

    return {
        templates,
        isLoading,
        error,
        refresh,
        toggleFavorite
    };
};
