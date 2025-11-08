import { useState, useEffect, useCallback } from 'react';
import { Customer, Lead, TimelineEvent } from '../types';
import { fetchCustomers, fetchLeads } from '../services/api';

const CUSTOMERS_KEY = 'crm_customers';
const LEADS_KEY = 'crm_leads';

export const useCrmData = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Check localStorage first
            const cachedCustomers = localStorage.getItem(CUSTOMERS_KEY);
            const cachedLeads = localStorage.getItem(LEADS_KEY);

            let initialCustomers: Customer[] = [];
            let initialLeads: Lead[] = [];

            if (cachedCustomers) {
                initialCustomers = JSON.parse(cachedCustomers);
                setCustomers(initialCustomers);
            }
             if (cachedLeads) {
                initialLeads = JSON.parse(cachedLeads);
                setLeads(initialLeads);
            }

            // Fetch fresh data only if cache is empty
            if (initialCustomers.length === 0 || initialLeads.length === 0) {
                 const [freshCustomers, freshLeads] = await Promise.all([
                    fetchCustomers(),
                    fetchLeads(),
                ]);

                setCustomers(freshCustomers);
                setLeads(freshLeads);

                // Update cache
                localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(freshCustomers));
                localStorage.setItem(LEADS_KEY, JSON.stringify(freshLeads));
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const syncToStorage = (key: string, data: any) => {
        localStorage.setItem(key, JSON.stringify(data));
    };
    
    const updateCustomersState = (newCustomers: Customer[]) => {
        setCustomers(newCustomers);
        syncToStorage(CUSTOMERS_KEY, newCustomers);
    };

    const addCustomer = useCallback((newCustomerData: Omit<Customer, 'id' | 'timeline'>) => {
        const newCustomer: Customer = {
            ...newCustomerData,
            id: `cust_${Date.now()}`,
            timeline: [{
                id: `tl_${Date.now()}`,
                date: new Date().toISOString(),
                type: 'note',
                title: 'Customer Created',
                content: `Profile created for ${newCustomerData.firstName} ${newCustomerData.lastName}.`,
                author: 'System'
            }]
        };
        updateCustomersState([...customers, newCustomer]);
    }, [customers]);

    const updateCustomer = useCallback((updatedCustomer: Customer) => {
        const updatedCustomers = customers.map(c =>
            c.id === updatedCustomer.id ? updatedCustomer : c
        );
        updateCustomersState(updatedCustomers);
    }, [customers]);

    const deleteCustomer = useCallback((customerId: string) => {
        const updatedCustomers = customers.filter(c => c.id !== customerId);
        updateCustomersState(updatedCustomers);
    }, [customers]);

    const logCustomerEvent = useCallback((customerId: string, event: Omit<TimelineEvent, 'id' | 'date'>) => {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;

        const newEvent: TimelineEvent = {
            ...event,
            id: `evt_${Date.now()}`,
            date: new Date().toISOString(),
        };
        
        const updatedCustomer = {
            ...customer,
            timeline: [...customer.timeline, newEvent]
        };
        updateCustomer(updatedCustomer);
    }, [customers, updateCustomer]);

    return {
        customers,
        leads,
        isLoading,
        error,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        logCustomerEvent,
        refetch: fetchData,
    };
};