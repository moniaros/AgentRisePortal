import { useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchUserActivity } from '../services/api';
import { UserActivityEvent } from '../types';

export const useUserActivity = (userId: string | undefined) => {
    const fetcher = useMemo(() => () => {
        if (!userId) return Promise.resolve([]);
        return fetchUserActivity(userId);
    }, [userId]);

    const { data, isLoading, error } = useOfflineSync<UserActivityEvent[]>(
        `user_activity_${userId}`,
        fetcher,
        []
    );

    const sortedActivity = useMemo(() =>
        [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [data]);

    return { activity: sortedActivity, isLoading, error };
};
