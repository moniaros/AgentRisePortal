import { useCallback, useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { Customer, Lead, TimelineEvent } from '../types';
import { useAuth } from './useAuth';
import { MOCK_CUSTOMERS, MOCK_LEADS } from '../data/mockData';

// In a real app, these would be API calls
const fetchCustomers = async (): Promise<Customer[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_CUSTOMERS), 500));
}

const fetchLeads = async (): Promise<Lead[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_LEADS), 500));
}


export const useCrmData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const { data: allCustomers, isLoading: customersLoading, error: customersError, updateData: setAllCustomers } = useOfflineSync<Customer[]>('customers_data', fetchCustomers, []);
    const { data: allLeads, isLoading: leadsLoading, error: leadsError, updateData: setAllLeads } = useOfflineSync<Lead[]>('leads_data', fetchLeads, []);

    const customers = useMemo(() => allCustomers.filter(c => c.agencyId === agencyId), [allCustomers, agencyId]);
    const leads = useMemo(() => allLeads.filter(l => l.agencyId === agencyId), [allLeads, agencyId]);
    
    const isLoading = customersLoading || leadsLoading;
    const error = customersError || leadsError;
    
    const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'timeline' | 'agencyId'>) => {
        if (!agencyId) return;
        const newCustomer: Customer = {
            ...customerData,
            id: `cust_${Date.now()}`,
            timeline: [{
                id: `evt_${Date.now()}`,
                date: new Date().toISOString(),
                type: 'note',
                content: 'Customer profile created.',
                author: 'System',
            }],
            agencyId,
        };
        setAllCustomers([...allCustomers, newCustomer]);
    }, [allCustomers, setAllCustomers, agencyId]);

    const updateCustomer = useCallback((updatedCustomer: Customer) => {
        setAllCustomers(allCustomers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    }, [allCustomers, setAllCustomers]);

    const deleteCustomer = useCallback((customerId: string) => {
        setAllCustomers(allCustomers.filter(c => c.id !== customerId));
    }, [allCustomers, setAllCustomers]);

    const addLead = useCallback((leadData: Omit<Lead, 'id' | 'createdAt'>) => {
        if (!agencyId) return;
        const newLead: Lead = {
            ...leadData,
            id: `lead_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        setAllLeads([...allLeads, newLead]);
    }, [allLeads, setAllLeads, agencyId]);
    
    const addTimelineEvent = useCallback((customerId: string, event: Omit<TimelineEvent, 'id' | 'date'>) => {
        const customer = allCustomers.find(c => c.id === customerId);
        if (!customer) return;

        const newEvent: TimelineEvent = {
            ...event,
            id: `evt_${Date.now()}`,
            date: new Date().toISOString(),
        };
        
        const updatedCustomer = {
            ...customer,
            timeline: [newEvent, ...customer.timeline],
        };
        updateCustomer(updatedCustomer);

    }, [allCustomers, updateCustomer]);

    return { customers, leads, isLoading, error, addCustomer, updateCustomer, deleteCustomer, addLead, addTimelineEvent };
};
