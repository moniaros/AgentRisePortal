import { useMemo, useCallback } from 'react';
import { useOfflineSync, broadcastStoreUpdate } from './useOfflineSync';
import {
    fetchTransactionInquiries,
    fetchTransactionQuoteRequests,
    fetchOpportunitiesExt,
    fetchProspects,
    fetchPipelineInteractions,
    fetchPipelineConversions,
    customerService,
} from '../services/api';
import {
    TransactionInquiry,
    TransactionQuoteRequest,
    Opportunity__EXT,
    Prospect,
    Interaction,
    Conversion,
    OpportunityStage,
    Customer,
    PolicyACORD,
    StoredFinding,
} from '../types';
import { useAuth } from './useAuth';
import { CarrierQuote } from '../lib/comparativeRater';
import { savePolicyForCustomer } from '../services/policyStorage';

export const usePipelineData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;
    const agentId = currentUser?.id;

    const { data: inquiries, isLoading: inquiriesLoading, error: inquiriesError } =
        useOfflineSync<TransactionInquiry[]>('agentos_db_inquiries', fetchTransactionInquiries, []);
    const { data: quoteRequests, isLoading: quotesLoading, error: quotesError } =
        useOfflineSync<TransactionQuoteRequest[]>('transaction_quoterequests', fetchTransactionQuoteRequests, []);
    const {
        data: opportunities,
        isLoading: oppsLoading,
        error: oppsError,
        updateData: setOpportunities,
    } = useOfflineSync<Opportunity__EXT[]>('agentos_db_opportunities', fetchOpportunitiesExt, []);
    const {
        data: prospects,
        isLoading: prospectsLoading,
        error: prospectsError,
        updateData: setProspects,
    } = useOfflineSync<Prospect[]>('agentos_db_prospects', fetchProspects, []);
    const {
        data: interactions,
        isLoading: interactionsLoading,
        error: interactionsError,
        updateData: setInteractions,
    } = useOfflineSync<Interaction[]>('agentos_db_interactions', fetchPipelineInteractions, []);
    const {
        data: conversions,
        isLoading: conversionsLoading,
        error: conversionsError,
        updateData: setConversions,
    } = useOfflineSync<Conversion[]>('agentos_db_conversions', fetchPipelineConversions, []);

    const isLoading =
        inquiriesLoading ||
        quotesLoading ||
        oppsLoading ||
        prospectsLoading ||
        interactionsLoading ||
        conversionsLoading;
    const error =
        inquiriesError ||
        quotesError ||
        oppsError ||
        prospectsError ||
        interactionsError ||
        conversionsError;

    const agencyInquiries = useMemo(
        () => (agencyId ? inquiries.filter((i) => i.agencyId === agencyId) : inquiries),
        [inquiries, agencyId]
    );
    const agencyOpportunities = useMemo(
        () => (agencyId ? opportunities.filter((o) => o.agencyId === agencyId) : opportunities),
        [opportunities, agencyId]
    );
    const agencyProspects = useMemo(
        () => (agencyId ? prospects.filter((p) => p.agencyId === agencyId) : prospects),
        [prospects, agencyId]
    );
    const agencyInteractions = useMemo(
        () => (agencyId ? interactions.filter((i) => i.agencyId === agencyId) : interactions),
        [interactions, agencyId]
    );

    const createOpportunity = useCallback(
        (inquiry: TransactionInquiry, initialValue = 350): Opportunity__EXT | null => {
            const effAgency = agencyId || inquiry.agencyId || 'agency_1';
            const effAgent = agentId || 'user_1';

            const newProspect: Prospect = {
                id: `prospect_${Date.now()}`,
                agencyId: effAgency,
                ...inquiry.contact,
            };
            setProspects([newProspect, ...prospects]);

            const newOpportunity: Opportunity__EXT = {
                id: `opp_${Date.now()}`,
                title: `${(inquiry.policyType || 'General').toUpperCase()} — ${inquiry.contact.firstName} ${inquiry.contact.lastName}`,
                value: initialValue,
                prospectId: newProspect.id,
                stage: 'new',
                nextFollowUpDate: new Date(Date.now() + 86_400_000).toISOString(),
                agentId: effAgent,
                agencyId: effAgency,
                inquiryId: inquiry.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setOpportunities([newOpportunity, ...opportunities]);
            return newOpportunity;
        },
        [agencyId, agentId, setOpportunities, setProspects, opportunities, prospects]
    );

    const createOpportunityFromFinding = useCallback(
        (finding: StoredFinding, customer?: Customer): Opportunity__EXT | null => {
            const effAgency = agencyId || finding.agencyId || 'agency_1';
            const effAgent = agentId || 'user_1';
            const firstName = customer?.firstName || 'Existing';
            const lastName = customer?.lastName || 'Client';

            const newProspect: Prospect = {
                id: `prospect_find_${Date.now()}`,
                agencyId: effAgency,
                firstName,
                lastName,
                email: customer?.email || '',
                phone: customer?.phone || '',
            };
            setProspects([newProspect, ...prospects]);

            const newOpportunity: Opportunity__EXT = {
                id: `opp_find_${Date.now()}`,
                title: `${finding.type === 'upsell' ? 'Upgrade' : 'Cross-Sell'}: ${finding.title} (${firstName} ${lastName})`,
                value: finding.estimatedValue || 350,
                prospectId: newProspect.id,
                stage: 'proposal',
                nextFollowUpDate: new Date(Date.now() + 86_400_000).toISOString(),
                agentId: effAgent,
                agencyId: effAgency,
                inquiryId: finding.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setOpportunities([newOpportunity, ...opportunities]);
            return newOpportunity;
        },
        [agencyId, agentId, setOpportunities, setProspects, opportunities, prospects]
    );

    const updateOpportunity = useCallback(
        (updated: Opportunity__EXT) => {
            const stamped = { ...updated, updatedAt: new Date().toISOString() };
            setOpportunities(opportunities.map((o) => (o.id === stamped.id ? stamped : o)));
        },
        [opportunities, setOpportunities]
    );

    const updateOpportunityStage = useCallback(
        (opportunityId: string, newStage: OpportunityStage) => {
            let updatedOpportunity: Opportunity__EXT | null = null;
            const newOpportunities = opportunities.map((opp) => {
                if (opp.id === opportunityId) {
                    updatedOpportunity = {
                        ...opp,
                        stage: newStage,
                        updatedAt: new Date().toISOString(),
                    };
                    return updatedOpportunity;
                }
                return opp;
            });

            setOpportunities(newOpportunities);

            if (newStage === 'won' && updatedOpportunity) {
                const target = updatedOpportunity as Opportunity__EXT;
                const newConversion: Conversion = {
                    id: `conv_${Date.now()}`,
                    date: new Date().toISOString(),
                    kind: 'won',
                    value: target.value,
                    attributionId: target.inquiryId,
                };
                setConversions([newConversion, ...conversions]);
            }
        },
        [opportunities, setOpportunities, setConversions, conversions]
    );

    const bindOpportunityToCustomer = useCallback(
        async (
            opportunity: Opportunity__EXT,
            quote: CarrierQuote,
            paymentMethod: 'IRIS' | 'Viva Wallet' | 'SEPA' | 'Card'
        ): Promise<{ customerId: string; policyNumber: string }> => {
            const effAgency = agencyId || opportunity.agencyId || 'agency_1';
            const prospect = prospects.find((p) => p.id === opportunity.prospectId);
            const allCustomers = await customerService.getAll();

            let targetCustomer = allCustomers.find(
                (c) =>
                    c.agencyId === effAgency &&
                    ((prospect?.email && c.email.toLowerCase() === prospect.email.toLowerCase()) ||
                        (prospect &&
                            c.firstName.toLowerCase() === prospect.firstName.toLowerCase() &&
                            c.lastName.toLowerCase() === prospect.lastName.toLowerCase()))
            );

            const today = new Date();
            const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
            const effectiveDate = today.toISOString().split('T')[0];
            const expirationDate = nextYear.toISOString().split('T')[0];
            const policyNumber = `${quote.carrierName.slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-6)}`;

            const authorName = currentUser
                ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`
                : 'AgentOS Bind Engine';

            if (!targetCustomer) {
                targetCustomer = {
                    id: `cust_${Date.now()}`,
                    agencyId: effAgency,
                    firstName: prospect?.firstName || 'Valued',
                    lastName: prospect?.lastName || 'Policyholder',
                    email: prospect?.email || 'client@example.com',
                    phone: prospect?.phone || '',
                    address: 'Athens, Greece',
                    policies: [],
                    timeline: [
                        {
                            id: `evt_bind_${Date.now()}`,
                            date: new Date().toISOString(),
                            type: 'policy_update',
                            author: authorName,
                            content: `Bound ${quote.carrierName} ${quote.policyType.toUpperCase()} policy #${policyNumber} (€${quote.annualGrossPremium}/yr via ${paymentMethod}). Commission €${quote.commissionEuro}.`,
                        },
                    ],
                    consent: {
                        gdpr: { isGiven: true, dateGranted: effectiveDate, channel: 'web_form' },
                        marketing: { isGiven: true, dateGranted: effectiveDate, channel: 'email' },
                    },
                };
                broadcastStoreUpdate('agentos_db_customers', [targetCustomer, ...allCustomers]);
            } else {
                const updatedCustomers = allCustomers.map((c) =>
                    c.id === targetCustomer!.id
                        ? {
                              ...c,
                              timeline: [
                                  {
                                      id: `evt_bind_${Date.now()}`,
                                      date: new Date().toISOString(),
                                      type: 'policy_update' as const,
                                      author: authorName,
                                      content: `Bound ${quote.carrierName} ${quote.policyType.toUpperCase()} policy #${policyNumber} (€${quote.annualGrossPremium}/yr via ${paymentMethod}). Commission €${quote.commissionEuro}.`,
                                  },
                                  ...c.timeline,
                              ],
                          }
                        : c
                );
                broadcastStoreUpdate('agentos_db_customers', updatedCustomers);
            }

            const acordPolicy: PolicyACORD = {
                id: `pol_acord_${Date.now()}`,
                policyNumber,
                insurer: { name: quote.carrierName },
                policyholder: {
                    name: `${targetCustomer.firstName} ${targetCustomer.lastName}`,
                    address: targetCustomer.address || 'Athens, Greece',
                },
                effectiveDate,
                expirationDate,
                coverages: quote.coverages,
                totalPremium: quote.annualGrossPremium,
                lastUpdated: new Date().toISOString(),
                beneficiaries: [],
            };

            // Persists PolicyACORD AND projects summary Policy into Customer.policies
            savePolicyForCustomer(targetCustomer.id, acordPolicy);

            // Mark Opportunity won with bound premium & record Conversion
            const wonOpp: Opportunity__EXT = {
                ...opportunity,
                value: quote.annualGrossPremium,
                stage: 'won',
                updatedAt: new Date().toISOString(),
            };
            setOpportunities(opportunities.map((o) => (o.id === opportunity.id ? wonOpp : o)));
            setConversions([
                {
                    id: `conv_${Date.now()}`,
                    date: new Date().toISOString(),
                    kind: 'won',
                    value: quote.annualGrossPremium,
                    attributionId: opportunity.inquiryId,
                },
                ...conversions,
            ]);

            return { customerId: targetCustomer.id, policyNumber };
        },
        [agencyId, prospects, currentUser, opportunities, setOpportunities, conversions, setConversions]
    );

    const addInteraction = useCallback(
        (interactionData: Omit<Interaction, 'id' | 'agentId' | 'agencyId' | 'createdAt'>) => {
            const effAgency = agencyId || 'agency_1';
            const effAgent = agentId || 'user_1';

            const newInteraction: Interaction = {
                id: `int_${Date.now()}`,
                ...interactionData,
                agentId: effAgent,
                agencyId: effAgency,
                createdAt: new Date().toISOString(),
            };
            setInteractions([newInteraction, ...interactions]);
        },
        [agencyId, agentId, setInteractions, interactions]
    );

    return {
        inquiries: agencyInquiries,
        quoteRequests,
        opportunities: agencyOpportunities,
        prospects: agencyProspects,
        interactions: agencyInteractions,
        conversions,
        isLoading,
        error,
        createOpportunity,
        createOpportunityFromFinding,
        updateOpportunity,
        updateOpportunityStage,
        bindOpportunityToCustomer,
        addInteraction,
    };
};