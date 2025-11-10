import { useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchCustomers, fetchLeads } from '../services/api';
import { Customer, Lead, TimelineEvent } from '../types';

export const useCrmData = () => {
  const { 
    data: customers, 
    isLoading: isCustomersLoading, 
    error: customersError, 
    updateData: setCustomers 
  } = useOfflineSync<Customer[]>('customers_data', fetchCustomers, []);

  const { 
    data: leads, 
    isLoading: isLeadsLoading, 
    error: leadsError,
    updateData: setLeads
  } = useOfflineSync<Lead[]>('leads_data', fetchLeads, []);

  const isLoading = isCustomersLoading || isLeadsLoading;
  const error = customersError || leadsError;

  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'timeline'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'note',
          title: 'Customer Created',
          content: 'Manually added via CRM.',
          author: 'Agent',
        }
      ],
    };
    setCustomers([...customers, newCustomer]);
  }, [customers, setCustomers]);
  
  const addLead = useCallback((leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLeads([...leads, newLead]);
  }, [leads, setLeads]);

  const updateCustomer = useCallback((updatedCustomer: Customer) => {
    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  }, [customers, setCustomers]);

  const deleteCustomer = useCallback((customerId: string) => {
    setCustomers(customers.filter(c => c.id !== customerId));
  }, [customers, setCustomers]);

  const logCustomerEvent = useCallback((customerId: string, eventData: Omit<TimelineEvent, 'id' | 'date' | 'author'> & { author: string }) => {
    const newEvent: TimelineEvent = {
        ...eventData,
        id: `tl_${Date.now()}`,
        date: new Date().toISOString(),
    };
    
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        const updatedCustomer = {
            ...customer,
            timeline: [...(customer.timeline || []), newEvent],
        };
        updateCustomer(updatedCustomer);
    }
  }, [customers, updateCustomer]);

  return { customers, leads, isLoading, error, addCustomer, addLead, updateCustomer, deleteCustomer, logCustomerEvent };
};