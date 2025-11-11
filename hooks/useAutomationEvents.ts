import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchAutomationEvents, fetchAutomationAnalytics } from '../services/api';
import { AutomationEvent, AutomationAnalytics } from '../types';
import { useAuth } from './useAuth';

export const useAutomationEvents = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allEvents,
        isLoading: isLoadingEvents,
        error: errorEvents,
    } = useOfflineSync<AutomationEvent[]>('automation_events_data', fetchAutomationEvents, []);

    const {
        data: analytics,
        isLoading: isLoadingAnalytics,
        error: errorAnalytics,
    } = useOfflineSync<AutomationAnalytics>('automation_analytics_data', fetchAutomationAnalytics, {
        conversionRateBefore: 0,
        conversionRateAfter: 0,
        messagesSentByChannel: [],
    });

    const events = useMemo(() => {
        return allEvents
            .filter(event => event.agencyId === agencyId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [allEvents, agencyId]);

    return {
        events,
        analytics,
        isLoading: isLoadingEvents || isLoadingAnalytics,
        error: errorEvents || errorAnalytics,
    };
};
