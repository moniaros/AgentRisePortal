import { useCallback, useMemo } from 'react';
import { useOfflineSync } from './useOfflineSync';
// FIX: Correct import path
import { Customer, Lead, TimelineEvent, Annotation, LeadStatus } from '../types';
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
                type: 'system',
                content: 'Customer profile created.',
                // FIX: Property 'name' does not exist on type 'User'. Use party.partyName properties instead.
                author: currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System',
            }],
            agencyId,
        };
        setAllCustomers([...allCustomers, newCustomer]);
    }, [allCustomers, setAllCustomers, agencyId, currentUser]);

    const updateCustomer = useCallback((updatedCustomer: Customer) => {
        setAllCustomers(allCustomers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    }, [allCustomers, setAllCustomers]);

    const deleteCustomer = useCallback((customerId: string) => {
        setAllCustomers(allCustomers.filter(c => c.id !== customerId));
    }, [allCustomers, setAllCustomers]);

    const addLead = useCallback((leadData: Omit<Lead, 'id' | 'createdAt' | 'agencyId'>) => {
        if (!agencyId) return;
        const newLead: Lead = {
            ...leadData,
            id: `lead_${Date.now()}`,
            createdAt: new Date().toISOString(),
            agencyId: agencyId
        };
        setAllLeads([...allLeads, newLead]);
    }, [allLeads, setAllLeads, agencyId]);

    const convertLeadToCustomer = useCallback((lead: Lead) => {
        if (!agencyId || lead.customerId) return; // Already converted or no agency

        // 1. Create new customer from lead data
        const newCustomer: Customer = {
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            phone: lead.phone,
            address: '',
            policies: [],
            id: `cust_${Date.now()}`,
            timeline: [{
                id: `evt_${Date.now()}`,
                date: new Date().toISOString(),
                type: 'system',
                content: `Customer profile created from lead #${lead.id}.`,
                author: currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System',
            }],
            agencyId,
        };
        // FIX: The `updateData` function from `useOfflineSync` expects the new array directly, not a callback.
        setAllCustomers([...allCustomers, newCustomer]);

        // 2. Update the lead to link to the new customer and change status
        const updatedLead: Lead = {
            ...lead,
            customerId: newCustomer.id,
            status: LeadStatus.CLOSED, // Mark as closed/converted
        };
        // FIX: The `updateData` function from `useOfflineSync` expects the new array directly, not a callback.
        setAllLeads(allLeads.map(l => l.id === lead.id ? updatedLead : l));
    }, [agencyId, currentUser, setAllCustomers, setAllLeads, allCustomers, allLeads]);
    
    const addTimelineEvent = useCallback((customerId: string, event: Omit<TimelineEvent, 'id' | 'date' | 'annotations' >) => {
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

    const addAnnotationToEvent = useCallback((customerId: string, eventId: string, annotationData: Omit<Annotation, 'id' | 'date'>) => {
        const customer = allCustomers.find(c => c.id === customerId);
        if (!customer) return;

        const newAnnotation: Annotation = {
            ...annotationData,
            id: `ann_${Date.now()}`,
            date: new Date().toISOString(),
        };
        
        const updatedTimeline = customer.timeline.map(event => {
            if (event.id === eventId) {
                return {
                    ...event,
                    annotations: [...(event.annotations || []), newAnnotation]
                };
            }
            return event;
        });
        
        updateCustomer({ ...customer, timeline: updatedTimeline });
    }, [allCustomers, updateCustomer]);

    const updateCustomerAttentionFlag = useCallback((customerId: string, reason: string | null) => {
        const customer = allCustomers.find(c => c.id === customerId);
        if (!customer) return;

        updateCustomer({ ...customer, attentionFlag: reason || undefined });
        
        addTimelineEvent(customerId, {
            type: 'system',
            content: reason ? `Attention flag set: ${reason}` : 'Attention flag cleared.',
            // FIX: Property 'name' does not exist on type 'User'. Use party.partyName properties instead.
            author: currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : 'System',
        });
    }, [allCustomers, updateCustomer, addTimelineEvent, currentUser]);

    const toggleTimelineEventFlag = useCallback((customerId: string, eventId: string) => {
        const customer = allCustomers.find(c => c.id === customerId);
        if (!customer) return;
        
        const updatedTimeline = customer.timeline.map(event => {
            if (event.id === eventId) {
                return { ...event, isFlagged: !event.isFlagged };
            }
            return event;
        });

        updateCustomer({ ...customer, timeline: updatedTimeline });
    }, [allCustomers, updateCustomer]);

    return { 
        customers, 
        leads, 
        isLoading, 
        error, 
        addCustomer, 
        updateCustomer, 
        deleteCustomer, 
        addLead,
        convertLeadToCustomer,
        addTimelineEvent,
        addAnnotationToEvent,
        updateCustomerAttentionFlag,
        toggleTimelineEventFlag,
    };
};
