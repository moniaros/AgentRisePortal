import { useCallback, useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchCustomers, fetchLeads } from '../services/api';
import { Customer, Lead, TimelineEvent } from '../types';
import { useAuth } from './useAuth';

export const useCrmData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: customers,
        isLoading: customersLoading,
        error: customersError,
        updateData: setCustomers,
    } = useOfflineSync<Customer[]>('customers_data', fetchCustomers, []);

    const {
        data: leads,
        isLoading: leadsLoading,
        error: leadsError,
        updateData: setLeads,
    } = useOfflineSync<Lead[]>('leads_data', fetchLeads, []);
    
    const agencyCustomers = useMemo(() => customers.filter(c => c.agencyId === agencyId), [customers, agencyId]);
    const agencyLeads = useMemo(() => leads.filter(l => l.agencyId === agencyId), [leads, agencyId]);


    const addLead = useCallback((leadData: Omit<Lead, 'id' | 'createdAt'>) => {
        const newLead: Lead = {
            ...leadData,
            id: `lead_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        setLeads([...leads, newLead]);
    }, [leads, setLeads]);
    
    const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'timeline'>) => {
        if (!agencyId) return;
        const newCustomer: Customer = {
            ...customerData,
            id: `cust_${Date.now()}`,
            timeline: [],
            agencyId: agencyId,
        };
        setCustomers([...customers, newCustomer]);
    }, [customers, setCustomers, agencyId]);

    const updateCustomer = useCallback((updatedCustomer: Customer) => {
        setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    }, [customers, setCustomers]);
    
    const deleteCustomer = useCallback((customerId: string) => {
        setCustomers(customers.filter(c => c.id !== customerId));
    }, [customers, setCustomers]);

    const logCustomerEvent = useCallback((customerId: string, eventData: Omit<TimelineEvent, 'id' | 'date'>) => {
        const newEvent: TimelineEvent = {
            ...eventData,
            id: `tl_${Date.now()}`,
            date: new Date().toISOString(),
        };
        const updatedCustomers = customers.map(c => {
            if (c.id === customerId) {
                return { ...c, timeline: [...c.timeline, newEvent] };
            }
            return c;
        });
        setCustomers(updatedCustomers);
    }, [customers, setCustomers]);

    return {
        customers: agencyCustomers,
        leads: agencyLeads,
        isLoading: customersLoading || leadsLoading,
        error: customersError || leadsError,
        addLead,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        logCustomerEvent,
    };
};
