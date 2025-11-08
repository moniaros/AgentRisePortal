import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { fetchSocialLeads } from '../services/api';
import { Lead } from '../types';
import LeadControls from '../components/leads/LeadControls';
import LeadsTable from '../components/leads/LeadsTable';

// Helper to safely get preferences from localStorage
const getStoredPreferences = () => {
  try {
    const stored = localStorage.getItem('socialLeadsPreferences');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure new filters have default values
      return {
        filters: {
          source: 'all',
          policyType: 'all',
          ...parsed.filters,
        },
        sorting: parsed.sorting || { key: 'createdAt', order: 'desc' },
      };
    }
  } catch (e) {
    console.warn("Failed to parse social leads preferences from localStorage", e);
    localStorage.removeItem('socialLeadsPreferences');
  }
  return {
    filters: { source: 'all', policyType: 'all' },
    sorting: { key: 'createdAt', order: 'desc' },
  };
};

// Helper to safely get tags from localStorage
const getStoredTags = (): { [key: string]: string[] } => {
    try {
        const stored = localStorage.getItem('socialLeadsTags');
        if (stored) return JSON.parse(stored);
    } catch(e) {
        console.warn("Failed to parse social leads tags from localStorage", e);
        localStorage.removeItem('socialLeadsTags');
    }
    return {};
}

const LeadGeneration: React.FC = () => {
    const { t } = useLocalization();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [preferences, setPreferences] = useState(getStoredPreferences);
    const [tags, setTags] = useState<{ [key: string]: string[] }>(getStoredTags);

    // Fetch leads from the centralized API service
    useEffect(() => {
        const loadLeads = async () => {
            try {
                const data = await fetchSocialLeads();
                setLeads(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };
        loadLeads();
    }, []);

    // Save preferences to localStorage
    useEffect(() => {
        localStorage.setItem('socialLeadsPreferences', JSON.stringify(preferences));
    }, [preferences]);

    // Save tags to localStorage
    useEffect(() => {
        localStorage.setItem('socialLeadsTags', JSON.stringify(tags));
    }, [tags]);

    const handlePreferencesChange = useCallback((type: 'filter' | 'sort', key: string, value: any) => {
        if (type === 'filter') {
            setPreferences(prev => ({ ...prev, filters: { ...prev.filters, [key]: value } }));
        } else if (type === 'sort') {
            const [sortKey, order] = value.split('-');
            setPreferences(prev => ({ ...prev, sorting: { key: sortKey, order } }));
        }
    }, []);
    
    const handleTagUpdate = useCallback((leadId: string, newTags: string[]) => {
        setTags(prev => ({ ...prev, [leadId]: newTags }));
    }, []);

    const processedLeads = useMemo(() => {
        let filtered = [...leads];
        // Apply source filter
        if (preferences.filters.source !== 'all') {
            filtered = filtered.filter(lead => lead.source === preferences.filters.source);
        }
        // Apply policy type filter
        if (preferences.filters.policyType !== 'all') {
            filtered = filtered.filter(lead => lead.policyType === preferences.filters.policyType);
        }

        const { key, order } = preferences.sorting;
        filtered.sort((a, b) => {
            let valA: string | number, valB: string | number;
            if (key === 'name') {
                valA = `${a.firstName} ${a.lastName}`.toLowerCase();
                valB = `${b.firstName} ${b.lastName}`.toLowerCase();
            } else if (key === 'potentialValue') {
                valA = a.potentialValue;
                valB = b.potentialValue;
            } else { // createdAt
                valA = new Date(a.createdAt).getTime();
                valB = new Date(b.createdAt).getTime();
            }
            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [leads, preferences]);

    const sources = useMemo(() => [...new Set(leads.map(lead => lead.source))], [leads]);

    if (isLoading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('leadGen.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('leadGen.description')}</p>

            <LeadControls 
                sources={sources}
                preferences={preferences}
                onPreferencesChange={handlePreferencesChange}
            />

            <LeadsTable
                leads={processedLeads}
                tags={tags}
                onTagUpdate={handleTagUpdate}
            />
        </div>
    );
};

export default LeadGeneration;