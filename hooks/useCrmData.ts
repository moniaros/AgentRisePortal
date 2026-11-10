import { useCallback, useMemo } from 'react';
import { useOfflineSync, broadcastStoreUpdate } from './useOfflineSync';
import { Customer, Lead, TimelineEvent, Annotation, LeadStatus, TransactionInquiry } from '../types';
import { useAuth } from './useAuth';
import { customerService, leadService, inquiryService } from '../services/api';

const fetchCustomers = () => customerService.getAll();
const fetchLeads = () => leadService.getAll();

export const useCrmData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const {
        data: allCustomers,
        isLoading: customersLoading,
        error: customersError,
        updateData: setAllCustomers,
    } = useOfflineSync<Customer[]>('agentos_db_customers', fetchCustomers, []);

    const {
        data: allLeads,
        isLoading: leadsLoading,
        error: leadsError,
        updateData: setAllLeads,
    } = useOfflineSync<Lead[]>('agentos_db_leads', fetchLeads, []);

    const customers = useMemo(
        () => (agencyId ? allCustomers.filter((c) => c.agencyId === agencyId) : allCustomers),
        [allCustomers, agencyId]
    );
    const leads = useMemo(
        () => (agencyId ? allLeads.filter((l) => l.agencyId === agencyId) : allLeads),
        [allLeads, agencyId]
    );

    const isLoading = customersLoading || leadsLoading;
    const error = customersError || leadsError;

    const addCustomer = useCallback(
        (customerData: Omit<Customer, 'id' | 'timeline' | 'agencyId'> & { agencyId?: string }): Customer | null => {
            const effectiveAgencyId = customerData.agencyId || agencyId || 'agency_1';
            const newCustomer: Customer = {
                ...customerData,
                id: `cust_${Date.now()}`,
                timeline: [
                    {
                        id: `evt_${Date.now()}`,
                        date: new Date().toISOString(),
                        type: 'system',
                        content: 'Customer profile created.',
                        author: currentUser
                            ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`
                            : 'System',
                    },
                ],
                agencyId: effectiveAgencyId,
            };
            setAllCustomers([...allCustomers, newCustomer]);
            return newCustomer;
        },
        [allCustomers, setAllCustomers, agencyId, currentUser]
    );

    const updateCustomer = useCallback(
        (updatedCustomer: Customer) => {
            setAllCustomers(allCustomers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
        },
        [allCustomers, setAllCustomers]
    );

    const deleteCustomer = useCallback(
        (customerId: string) => {
            setAllCustomers(allCustomers.filter((c) => c.id !== customerId));
        },
        [allCustomers, setAllCustomers]
    );

    const addLead = useCallback(
        (
            leadData: Omit<Lead, 'id' | 'createdAt' | 'agencyId'> & {
                agencyId?: string;
                details?: string;
                consentGDPR?: boolean;
            }
        ): Lead => {
            const effectiveAgencyId = leadData.agencyId || agencyId || 'agency_1';
            const { details, consentGDPR, ...cleanLeadFields } = leadData;
            const computedScore =
                cleanLeadFields.score ??
                Math.min(
                    98,
                    65 +
                        (cleanLeadFields.phone ? 15 : 0) +
                        (cleanLeadFields.potentialValue > 400 ? 12 : 5)
                );

            const newLead: Lead = {
                ...cleanLeadFields,
                score: computedScore,
                id: `lead_${Date.now()}`,
                createdAt: new Date().toISOString(),
                agencyId: effectiveAgencyId,
            };
            setAllLeads([newLead, ...allLeads]);

            // Bridge Silo 2: Also emit a linked TransactionInquiry so LeadsInbox & Dashboard react immediately
            inquiryService
                .getAll()
                .then((existingInquiries) => {
                    const inquiry: TransactionInquiry = {
                        id: `inq_${Date.now()}`,
                        agencyId: effectiveAgencyId,
                        createdAt: newLead.createdAt,
                        contact: {
                            firstName: newLead.firstName,
                            lastName: newLead.lastName,
                            email: newLead.email,
                            phone: newLead.phone || '',
                        },
                        consentGDPR: consentGDPR ?? true,
                        source: newLead.source || 'Campaign',
                        purpose: 'quote_request',
                        policyType: newLead.policyType,
                        details:
                            details ||
                            `Inbound ${newLead.policyType.toUpperCase()} inquiry from ${newLead.source}${
                                newLead.potentialValue ? ` · Indicative annual value €${newLead.potentialValue}` : ''
                            }.`,
                        attribution: {
                            utm_source: newLead.source.toLowerCase(),
                            utm_campaign: newLead.campaignId,
                        },
                        attributionId: newLead.campaignId || newLead.id,
                    };
                    broadcastStoreUpdate('agentos_db_inquiries', [inquiry, ...existingInquiries]);
                })
                .catch(() => {});

            // Notify live automation listener (wired in Iteration 3)
            if (typeof window !== 'undefined') {
                window.dispatchEvent(
                    new CustomEvent('agentos:lead-created', { detail: { lead: newLead } })
                );
            }

            return newLead;
        },
        [allLeads, setAllLeads, agencyId]
    );

    const updateLeadStatus = useCallback(
        (leadId: string, status: LeadStatus) => {
            let updatedTarget: Lead | null = null;
            const nextLeads = allLeads.map((l) => {
                if (l.id === leadId) {
                    updatedTarget = { ...l, status };
                    return updatedTarget;
                }
                return l;
            });
            setAllLeads(nextLeads);
            if (updatedTarget && typeof window !== 'undefined') {
                window.dispatchEvent(
                    new CustomEvent('agentos:lead-status-changed', { detail: { lead: updatedTarget } })
                );
            }
        },
        [allLeads, setAllLeads]
    );

    const convertLeadToCustomer = useCallback(
        (lead: Lead) => {
            const effectiveAgencyId = lead.agencyId || agencyId || 'agency_1';
            if (lead.customerId) return;

            const newCustomer: Customer = {
                firstName: lead.firstName,
                lastName: lead.lastName,
                email: lead.email,
                phone: lead.phone,
                address: '',
                policies: [],
                id: `cust_${Date.now()}`,
                timeline: [
                    {
                        id: `evt_${Date.now()}`,
                        date: new Date().toISOString(),
                        type: 'system',
                        content: `Customer profile created from lead #${lead.id} (${lead.source}).`,
                        author: currentUser
                            ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`
                            : 'System',
                    },
                ],
                agencyId: effectiveAgencyId,
            };
            setAllCustomers([...allCustomers, newCustomer]);

            const updatedLead: Lead = {
                ...lead,
                customerId: newCustomer.id,
                status: LeadStatus.CLOSED,
            };
            setAllLeads(allLeads.map((l) => (l.id === lead.id ? updatedLead : l)));
        },
        [agencyId, currentUser, setAllCustomers, setAllLeads, allCustomers, allLeads]
    );

    const addTimelineEvent = useCallback(
        (customerId: string, event: Omit<TimelineEvent, 'id' | 'date' | 'annotations'>) => {
            const customer = allCustomers.find((c) => c.id === customerId);
            if (!customer) return;

            const newEvent: TimelineEvent = {
                ...event,
                id: `evt_${Date.now()}`,
                date: new Date().toISOString(),
            };

            updateCustomer({
                ...customer,
                timeline: [newEvent, ...customer.timeline],
            });
        },
        [allCustomers, updateCustomer]
    );

    const addAnnotationToEvent = useCallback(
        (customerId: string, eventId: string, annotationData: Omit<Annotation, 'id' | 'date'>) => {
            const customer = allCustomers.find((c) => c.id === customerId);
            if (!customer) return;

            const newAnnotation: Annotation = {
                ...annotationData,
                id: `ann_${Date.now()}`,
                date: new Date().toISOString(),
            };

            const updatedTimeline = customer.timeline.map((event) => {
                if (event.id === eventId) {
                    return {
                        ...event,
                        annotations: [...(event.annotations || []), newAnnotation],
                    };
                }
                return event;
            });

            updateCustomer({ ...customer, timeline: updatedTimeline });
        },
        [allCustomers, updateCustomer]
    );

    const updateCustomerAttentionFlag = useCallback(
        (customerId: string, reason: string | null) => {
            const customer = allCustomers.find((c) => c.id === customerId);
            if (!customer) return;

            const statusEvent: TimelineEvent = {
                id: `evt_${Date.now()}`,
                date: new Date().toISOString(),
                type: 'system',
                content: reason ? `Attention flag set: ${reason}` : 'Attention flag cleared.',
                author: currentUser
                    ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`
                    : 'System',
            };

            updateCustomer({
                ...customer,
                attentionFlag: reason || undefined,
                timeline: [statusEvent, ...customer.timeline],
            });
        },
        [allCustomers, updateCustomer, currentUser]
    );

    const toggleTimelineEventFlag = useCallback(
        (customerId: string, eventId: string) => {
            const customer = allCustomers.find((c) => c.id === customerId);
            if (!customer) return;

            const updatedTimeline = customer.timeline.map((event) =>
                event.id === eventId ? { ...event, isFlagged: !event.isFlagged } : event
            );

            updateCustomer({ ...customer, timeline: updatedTimeline });
        },
        [allCustomers, updateCustomer]
    );

    return {
        customers,
        leads,
        isLoading,
        error,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addLead,
        updateLeadStatus,
        convertLeadToCustomer,
        addTimelineEvent,
        addAnnotationToEvent,
        updateCustomerAttentionFlag,
        toggleTimelineEventFlag,
    };
};
