import { useState, useEffect, useCallback, useRef } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

const KEY_TO_SERVER_COLLECTION: Record<string, string> = {
  customers_data: 'customers',
  agentos_db_customers: 'customers',
  leads_data: 'leads',
  agentos_db_leads: 'leads',
  transaction_inquiries: 'inquiries',
  agentos_db_inquiries: 'inquiries',
  opportunities_ext: 'opportunities',
  agentos_db_opportunities: 'opportunities',
  prospects: 'prospects',
  agentos_db_prospects: 'prospects',
  pipeline_interactions: 'interactions',
  agentos_db_interactions: 'interactions',
  pipeline_conversions: 'conversions',
  agentos_db_conversions: 'conversions',
  automation_rules_data: 'automation_rules',
  agentos_db_automation_rules: 'automation_rules',
  automation_events_data: 'automation_events',
  agentos_db_automation_events: 'automation_events',
  agentos_db_tasks: 'tasks',
  agentos_db_campaigns: 'campaigns',
  agentos_db_ftnol: 'ftnol',
  ftnol_data: 'ftnol',
  agentos_db_service_requests: 'service_requests',
  service_requests_data: 'service_requests',
};

export function canonicalizeStorageKey(key: string): string {
  const aliases: Record<string, string> = {
    customers_data: 'agentos_db_customers',
    leads_data: 'agentos_db_leads',
    transaction_inquiries: 'agentos_db_inquiries',
    opportunities_ext: 'agentos_db_opportunities',
    prospects: 'agentos_db_prospects',
    pipeline_interactions: 'agentos_db_interactions',
    pipeline_conversions: 'agentos_db_conversions',
    automation_rules_data: 'agentos_db_automation_rules',
    automation_events_data: 'agentos_db_automation_events',
    ftnol_data: 'agentos_db_ftnol',
    service_requests_data: 'agentos_db_service_requests',
  };
  return aliases[key] || key;
}

export function broadcastStoreUpdate<T>(rawKey: string, nextData: T): void {
  const canonicalKey = canonicalizeStorageKey(rawKey);
  try {
    localStorage.setItem(canonicalKey, JSON.stringify(nextData));
    if (canonicalKey !== rawKey) {
      localStorage.setItem(rawKey, JSON.stringify(nextData));
    }
  } catch (err) {
    console.warn(`Failed writing key ${canonicalKey} to localStorage:`, err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('agentos:sync', {
        detail: { key: canonicalKey, data: nextData },
      })
    );
  }

  const serverCollection = KEY_TO_SERVER_COLLECTION[canonicalKey] || KEY_TO_SERVER_COLLECTION[rawKey];
  if (serverCollection && Array.isArray(nextData) && typeof window !== 'undefined') {
    const token = sessionStorage.getItem('agentos_token');
    fetch(`/api/store/${serverCollection}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ items: nextData }),
    }).catch(() => {
      // Offline mode continues using localStorage cache seamlessly
    });
  }
}

export const useOfflineSync = <T,>(
  rawKey: string,
  fetcher: () => Promise<T>,
  initialData: T
) => {
  const key = canonicalizeStorageKey(rawKey);
  const [data, setData] = useState<T>(() => {
    try {
      const cached = localStorage.getItem(key) ?? localStorage.getItem(rawKey);
      return cached ? JSON.parse(cached) : initialData;
    } catch {
      return initialData;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !(localStorage.getItem(key) ?? localStorage.getItem(rawKey));
  });
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useOnlineStatus();
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const syncData = useCallback(async () => {
    setError(null);
    const serverCollection = KEY_TO_SERVER_COLLECTION[key] || KEY_TO_SERVER_COLLECTION[rawKey];

    try {
      // 1. Check server store first if online and mapped
      if (isOnline && serverCollection) {
        try {
          const resp = await fetch(`/api/store/${serverCollection}`);
          if (resp.ok) {
            const payload = await resp.json();
            if (payload.initialized && Array.isArray(payload.items)) {
              setData(payload.items as T);
              localStorage.setItem(key, JSON.stringify(payload.items));
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // Fall back to local cache / seed below
        }
      }

      // 2. Check existing localStorage (never overwrite user-mutated records with static seed!)
      const existingRaw = localStorage.getItem(key) ?? localStorage.getItem(rawKey);
      if (existingRaw) {
        try {
          const parsed = JSON.parse(existingRaw) as T;
          setData(parsed);
          // Seed server store if online and server wasn't initialized yet
          if (isOnline && serverCollection && Array.isArray(parsed)) {
            fetch(`/api/store/${serverCollection}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: parsed }),
            }).catch(() => {});
          }
          setIsLoading(false);
          return;
        } catch {
          localStorage.removeItem(key);
        }
      }

      // 3. No server state and no local cache -> run initial seed fetcher once
      if (isOnline) {
        setIsLoading(true);
        const seeded = await fetcherRef.current();
        setData(seeded);
        broadcastStoreUpdate(key, seeded);
      } else {
        throw new Error('Offline and no cached data available.');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [key, rawKey, isOnline]);

  useEffect(() => {
    syncData();
  }, [syncData]);

  // Cross-component real-time subscription within same tab & across storage events
  useEffect(() => {
    const handleCustomSync = (event: Event) => {
      const custom = event as CustomEvent<{ key: string; data: T }>;
      if (custom.detail?.key === key) {
        setData(custom.detail.data);
      }
    };
    const handleStorage = (event: StorageEvent) => {
      if ((event.key === key || event.key === rawKey) && event.newValue) {
        try {
          setData(JSON.parse(event.newValue));
        } catch {
          // Ignore malformed external storage write
        }
      }
    };

    window.addEventListener('agentos:sync', handleCustomSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('agentos:sync', handleCustomSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [key, rawKey]);

  const updateData = useCallback(
    (newData: T) => {
      setData(newData);
      broadcastStoreUpdate(key, newData);
    },
    [key]
  );

  return { data, isLoading, error, isOnline, refresh: syncData, updateData };
};
