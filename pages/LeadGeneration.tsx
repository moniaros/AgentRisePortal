import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { fetchLeads } from '../services/api';
import { Lead } from '../types';
import LeadControls from '../components/leads/LeadControls';
import LeadsTable from '../components/leads/LeadsTable';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import ErrorMessage from '../components/ui/ErrorMessage';

const LeadGeneration: React.FC = () => {
    const { t } = useLocalization();
    
    const { data: leads, isLoading, error } = useOfflineSync<Lead[]>('leads_data', fetchLeads, []);
    const [tags, setTags] = useState<{ [key: string]: string[] }>(() => {
        const saved = localStorage.getItem('lead_tags');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('lead_tags', JSON.stringify(tags));
    }, [tags]);
    
    const [preferences, setPreferences] = useState({
        filters: { source: 'all', policyType: 'all' },
        sorting: { key: 'createdAt', order: 'desc' },
    });
    
    const sources = useMemo(() => [...new Set(leads.map(lead => lead.source))], [leads]);
    
    const filteredAndSortedLeads = useMemo(() => {
        let processedLeads = [...leads];

        // Filtering
        if (preferences.filters.source !== 'all') {
            processedLeads = processedLeads.filter(lead => lead.source === preferences.filters.source);
        }
        if (preferences.filters.policyType !== 'all') {
            processedLeads = processedLeads.filter(lead => lead.policyType === preferences.filters.policyType);
        }

        // Sorting
        processedLeads.sort((a, b) => {
            const { key, order } = preferences.sorting;
            const aVal = a[key as keyof Lead];
            const bVal = b[key as keyof Lead];

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return processedLeads;
    }, [leads, preferences]);

    const handlePreferencesChange = (type: 'filter' | 'sort', key: string, value: any) => {
        if (type === 'sort') {
            const [sortKey, sortOrder] = value.split('-');
            setPreferences(prev => ({ ...prev, sorting: { key: sortKey, order: sortOrder } }));
        } else {
            setPreferences(prev => ({ ...prev, filters: { ...prev.filters, [key]: value } }));
        }
    };
    
    const handleTagUpdate = (leadId: string, newTags: string[]) => {
        setTags(prev => ({ ...prev, [leadId]: newTags }));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('nav.leadGen')}</h1>
            
            <LeadControls 
                sources={sources}
                preferences={preferences}
                onPreferencesChange={handlePreferencesChange}
            />

            {error && <ErrorMessage message={error.message} />}

            {isLoading ? (
                <div className="space-y-2">
                    <SkeletonLoader className="h-16 w-full" />
                    <SkeletonLoader className="h-16 w-full" />
                    <SkeletonLoader className="h-16 w-full" />
                </div>
            ) : (
                <LeadsTable leads={filteredAndSortedLeads} tags={tags} onTagUpdate={handleTagUpdate} />
            )}
        </div>
    );
};

export default LeadGeneration;
