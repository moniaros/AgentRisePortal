import { useCallback, useState, useEffect } from 'react';
import { Customer, Lead, TimelineEvent, Annotation } from '../types';
import { useAuth } from './useAuth';
import { customerService } from '../services/customerService';
import { leadService } from '../services/leadService';

export const useCrmData = () => {
    const { currentUser } = useAuth();
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [allLeads, setAllLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch customers and leads from API
    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Fetch customers and leads in parallel
                const [customersResponse, leadsResponse] = await Promise.all([
                    customerService.getCustomers({ limit: 1000 }),
                    leadService.getLeads({ limit: 1000 })
                ]);

                // Convert API responses to app Customer/Lead types
                const customers: Customer[] = customersResponse.data.map((c: any) => ({
                    id: c.id.toString(),
                    party: {
                        partyName: {
                            firstName: c.firstName,
                            lastName: c.lastName
                        },
                        contactInfo: {
                            email: c.email || '',
                            phone: c.phone || '',
                            address: c.address ? `${c.address.street || ''}, ${c.address.city || ''}, ${c.address.state || ''} ${c.address.zip || ''}`.trim() : ''
                        }
                    },
                    status: c.status,
                    customerSince: c.customerSince,
                    totalPremium: c.totalPremium,
                    lifetimeValue: c.lifetimeValue,
                    policyCount: c.policyCount,
                    assignedAgent: c.assignedAgent,
                    communicationPreference: c.communicationPreference,
                    attentionFlag: c.attentionReason || undefined,
                    tags: c.tags || [],
                    timeline: c.timeline || [],
                    policies: c.policies || [],
                    agencyId: 'default' // TODO: Get from currentUser when available
                }));

                const leads: Lead[] = leadsResponse.data.map((l: any) => ({
                    id: l.id.toString(),
                    party: {
                        partyName: {
                            firstName: l.firstName,
                            lastName: l.lastName
                        },
                        contactInfo: {
                            email: l.email || '',
                            phone: l.phone || '',
                            address: ''
                        }
                    },
                    source: l.source,
                    status: l.status,
                    interest: l.interest,
                    score: l.score,
                    assignedAgent: l.assignedAgent,
                    createdAt: l.createdAt,
                    contactedAt: l.contactedAt,
                    convertedAt: l.convertedAt,
                    agencyId: 'default' // TODO: Get from currentUser when available
                }));

                setAllCustomers(customers);
                setAllLeads(leads);
            } catch (err: any) {
                console.error('Failed to fetch CRM data:', err);
                setError(err.message || 'Failed to fetch CRM data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const addCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'timeline' | 'agencyId'>) => {
        try {
            const createData = {
                firstName: customerData.party.partyName.firstName,
                lastName: customerData.party.partyName.lastName,
                email: customerData.party.contactInfo.email,
                phone: customerData.party.contactInfo.phone,
                communicationPreference: customerData.communicationPreference as any,
                tags: customerData.tags
            };

            const result = await customerService.createCustomer(createData);

            // Fetch the new customer and add to list
            const newCustomer = await customerService.getCustomerById(result.id);
            const convertedCustomer: Customer = {
                id: newCustomer.id.toString(),
                party: {
                    partyName: {
                        firstName: newCustomer.firstName,
                        lastName: newCustomer.lastName
                    },
                    contactInfo: {
                        email: newCustomer.email || '',
                        phone: newCustomer.phone || '',
                        address: ''
                    }
                },
                status: newCustomer.status,
                customerSince: newCustomer.customerSince,
                totalPremium: newCustomer.totalPremium,
                lifetimeValue: newCustomer.lifetimeValue,
                timeline: newCustomer.timeline || [],
                policies: newCustomer.policies || [],
                agencyId: 'default'
            };

            setAllCustomers(prev => [...prev, convertedCustomer]);
        } catch (err) {
            console.error('Failed to create customer:', err);
            throw err;
        }
    }, []);

    const updateCustomer = useCallback(async (updatedCustomer: Customer) => {
        try {
            const updateData = {
                firstName: updatedCustomer.party.partyName.firstName,
                lastName: updatedCustomer.party.partyName.lastName,
                email: updatedCustomer.party.contactInfo.email,
                phone: updatedCustomer.party.contactInfo.phone,
                status: updatedCustomer.status as any,
                communicationPreference: updatedCustomer.communicationPreference as any,
                tags: updatedCustomer.tags,
                attentionFlag: !!updatedCustomer.attentionFlag,
                attentionReason: updatedCustomer.attentionFlag || undefined
            };

            await customerService.updateCustomer(parseInt(updatedCustomer.id), updateData);

            // Update local state
            setAllCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        } catch (err) {
            console.error('Failed to update customer:', err);
            throw err;
        }
    }, []);

    const deleteCustomer = useCallback(async (customerId: string) => {
        try {
            await customerService.deleteCustomer(parseInt(customerId));
            setAllCustomers(prev => prev.filter(c => c.id !== customerId));
        } catch (err) {
            console.error('Failed to delete customer:', err);
            throw err;
        }
    }, []);

    const addLead = useCallback(async (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
        try {
            const createData = {
                firstName: leadData.party.partyName.firstName,
                lastName: leadData.party.partyName.lastName,
                email: leadData.party.contactInfo.email,
                phone: leadData.party.contactInfo.phone,
                source: leadData.source,
                interest: leadData.interest
            };

            const result = await leadService.createLead(createData);

            // Fetch the new lead and add to list
            const newLead = await leadService.getLeadById(result.id);
            const convertedLead: Lead = {
                id: newLead.id.toString(),
                party: {
                    partyName: {
                        firstName: newLead.firstName,
                        lastName: newLead.lastName
                    },
                    contactInfo: {
                        email: newLead.email || '',
                        phone: newLead.phone || '',
                        address: ''
                    }
                },
                source: newLead.source,
                status: newLead.status,
                interest: newLead.interest,
                score: newLead.score,
                createdAt: newLead.createdAt,
                agencyId: 'default'
            };

            setAllLeads(prev => [...prev, convertedLead]);
        } catch (err) {
            console.error('Failed to create lead:', err);
            throw err;
        }
    }, []);

    const addTimelineEvent = useCallback(async (customerId: string, event: Omit<TimelineEvent, 'id' | 'date'>) => {
        try {
            const timelineData = {
                entryType: event.type as any,
                title: event.content.substring(0, 100), // Use first 100 chars as title
                description: event.content,
                metadata: event.metadata
            };

            await customerService.addTimelineEntry(parseInt(customerId), timelineData);

            // Refresh customer data
            const updatedCustomer = await customerService.getCustomerById(parseInt(customerId));
            const convertedCustomer: Customer = {
                id: updatedCustomer.id.toString(),
                party: {
                    partyName: {
                        firstName: updatedCustomer.firstName,
                        lastName: updatedCustomer.lastName
                    },
                    contactInfo: {
                        email: updatedCustomer.email || '',
                        phone: updatedCustomer.phone || '',
                        address: ''
                    }
                },
                status: updatedCustomer.status,
                customerSince: updatedCustomer.customerSince,
                totalPremium: updatedCustomer.totalPremium,
                lifetimeValue: updatedCustomer.lifetimeValue,
                timeline: updatedCustomer.timeline || [],
                policies: updatedCustomer.policies || [],
                agencyId: 'default'
            };

            setAllCustomers(prev => prev.map(c => c.id === customerId ? convertedCustomer : c));
        } catch (err) {
            console.error('Failed to add timeline event:', err);
            throw err;
        }
    }, []);

    const addAnnotationToEvent = useCallback((customerId: string, eventId: string, annotationData: Omit<Annotation, 'id' | 'date'>) => {
        // Note: This functionality would need a backend endpoint
        // For now, we'll handle it locally
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

        const updatedCustomer = { ...customer, timeline: updatedTimeline };
        setAllCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
    }, [allCustomers]);

    const updateCustomerAttentionFlag = useCallback(async (customerId: string, reason: string | null) => {
        try {
            await customerService.updateCustomer(parseInt(customerId), {
                attentionFlag: !!reason,
                attentionReason: reason || undefined
            });

            // Refresh customer data
            const updatedCustomer = await customerService.getCustomerById(parseInt(customerId));
            const convertedCustomer: Customer = {
                id: updatedCustomer.id.toString(),
                party: {
                    partyName: {
                        firstName: updatedCustomer.firstName,
                        lastName: updatedCustomer.lastName
                    },
                    contactInfo: {
                        email: updatedCustomer.email || '',
                        phone: updatedCustomer.phone || '',
                        address: ''
                    }
                },
                status: updatedCustomer.status,
                customerSince: updatedCustomer.customerSince,
                totalPremium: updatedCustomer.totalPremium,
                lifetimeValue: updatedCustomer.lifetimeValue,
                timeline: updatedCustomer.timeline || [],
                policies: updatedCustomer.policies || [],
                attentionFlag: reason || undefined,
                agencyId: 'default'
            };

            setAllCustomers(prev => prev.map(c => c.id === customerId ? convertedCustomer : c));
        } catch (err) {
            console.error('Failed to update attention flag:', err);
            throw err;
        }
    }, []);

    const toggleTimelineEventFlag = useCallback((customerId: string, eventId: string) => {
        // Note: This functionality would need a backend endpoint
        // For now, we'll handle it locally
        const customer = allCustomers.find(c => c.id === customerId);
        if (!customer) return;

        const updatedTimeline = customer.timeline.map(event => {
            if (event.id === eventId) {
                return { ...event, isFlagged: !event.isFlagged };
            }
            return event;
        });

        const updatedCustomer = { ...customer, timeline: updatedTimeline };
        setAllCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
    }, [allCustomers]);

    // Filter by agency (when multi-agency support is added)
    const customers = allCustomers;
    const leads = allLeads;

    return {
        customers,
        leads,
        isLoading,
        error,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addLead,
        addTimelineEvent,
        addAnnotationToEvent,
        updateCustomerAttentionFlag,
        toggleTimelineEventFlag,
    };
};
