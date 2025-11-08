import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

export const useOfflineSync = <T,>(
  key: string,
  fetcher: () => Promise<T>,
  initialData: T
) => {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useOnlineStatus();

  const syncData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First, try to get data from localStorage safely
      const cachedData = localStorage.getItem(key);
      if (cachedData) {
        try {
          setData(JSON.parse(cachedData));
        } catch (e) {
          console.warn(`Could not parse cached data for key "${key}". Fetching fresh data.`, e);
          localStorage.removeItem(key); // Clear corrupted data
        }
      }

      // If online, fetch fresh data and update cache
      if (isOnline) {
        const freshData = await fetcher();
        setData(freshData);
        localStorage.setItem(key, JSON.stringify(freshData));
      } else if (!cachedData) {
        // If offline and no cache, it's an error
        throw new Error("Offline and no cached data available.");
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fetcher, isOnline]);

  useEffect(() => {
    syncData();
  }, [syncData]);
  
  // Custom update function that writes to local storage for offline use
  const updateData = (newData: T) => {
      setData(newData);
      localStorage.setItem(key, JSON.stringify(newData));
      // Here you would typically also queue up a sync to the server when online
  };


  return { data, isLoading, error, isOnline, refresh: syncData, updateData };
};
