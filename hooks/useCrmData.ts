import { useCallback, useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchCustomers, fetchLeads } from '../services/api';
import { Customer, Lead, TimelineEvent } from '../types';
import { useAuth } from './useAuth';

export const useCrmData = () => {
  const { currentUser } = useAuth();
  const agencyId = currentUser?.agencyId;

  const { 
    data: allCustomers, 
    isLoading: isCustomersLoading, 
    error: customersError, 
    updateData: setAllCustomers 
  } = useOfflineSync<Customer[]>('customers_data', fetchCustomers, []);

  const { 
    data: allLeads, 
    isLoading: isLeadsLoading, 
    error: leadsError,
    updateData: setAllLeads
  } = useOfflineSync<Lead[]>('leads_data', fetchLeads, []);

  const customers = useMemo(() => allCustomers.filter(c => c.agencyId === agencyId), [allCustomers, agencyId]);
  const leads = useMemo(() => allLeads.filter(l => l.agencyId === agencyId), [allLeads, agencyId]);

  const isLoading = isCustomersLoading || isLeadsLoading;
  const error = customersError || leadsError;

  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'timeline' | 'agencyId'>) => {
    if (!agencyId) return;
    const newCustomer: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      agencyId: agencyId,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          date: new Date().toISOString(),
          type: 'note',
          title: 'Customer Created',
          content: 'Manually added via CRM.',
          author: currentUser?.name || 'Agent',
        }
      ],
    };
    setAllCustomers([...allCustomers, newCustomer]);
  }, [allCustomers, setAllCustomers, agencyId, currentUser]);
  
  const addLead = useCallback((leadData: Omit<Lead, 'id' | 'createdAt' | 'agencyId'>) => {
    if (!agencyId) return;
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      agencyId: agencyId,
    };
    setAllLeads([...allLeads, newLead]);
  }, [allLeads, setAllLeads, agencyId]);

  const updateCustomer = useCallback((updatedCustomer: Customer) => {
    setAllCustomers(allCustomers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  }, [allCustomers, setAllCustomers]);

  const deleteCustomer = useCallback((customerId: string) => {
    setAllCustomers(allCustomers.filter(c => c.id !== customerId));
  }, [allCustomers, setAllCustomers]);

  const logCustomerEvent = useCallback((customerId: string, eventData: Omit<TimelineEvent, 'id' | 'date' | 'author'> & { author: string }) => {
    const newEvent: TimelineEvent = {
        ...eventData,
        id: `tl_${Date.now()}`,
        date: new Date().toISOString(),
    };
    
    const customer = allCustomers.find(c => c.id === customerId);
    if (customer) {
        const updatedCustomer = {
            ...customer,
            timeline: [...(customer.timeline || []), newEvent],
        };
        updateCustomer(updatedCustomer);
    }
  }, [allCustomers, updateCustomer]);

  return { customers, leads, isLoading, error, addCustomer, addLead, updateCustomer, deleteCustomer, logCustomerEvent };
};
