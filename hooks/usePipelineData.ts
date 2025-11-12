import { useState, useMemo, useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { fetchTransactionInquiries, fetchTransactionQuoteRequests, fetchOpportunitiesExt, fetchProspects, fetchPipelineInteractions, fetchPipelineConversions } from '../services/api';
import { TransactionInquiry, TransactionQuoteRequest, Opportunity__EXT, Prospect, Interaction, Conversion, OpportunityStage } from '../types';
import { useAuth } from './useAuth';

export const usePipelineData = () => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;
    const agentId = currentUser?.id;

    const { data: inquiries, isLoading: inquiriesLoading, error: inquiriesError } = useOfflineSync<TransactionInquiry[]>('transaction_inquiries', fetchTransactionInquiries, []);
    const { data: quoteRequests, isLoading: quotesLoading, error: quotesError } = useOfflineSync<TransactionQuoteRequest[]>('transaction_quoterequests', fetchTransactionQuoteRequests, []);
    const { data: opportunities, isLoading: oppsLoading, error: oppsError, updateData: setOpportunities } = useOfflineSync<Opportunity__EXT[]>('opportunities_ext', fetchOpportunitiesExt, []);
    const { data: prospects, isLoading: prospectsLoading, error: prospectsError, updateData: setProspects } = useOfflineSync<Prospect[]>('prospects', fetchProspects, []);
    const { data: interactions, isLoading: interactionsLoading, error: interactionsError, updateData: setInteractions } = useOfflineSync<Interaction[]>('pipeline_interactions', fetchPipelineInteractions, []);
    const { data: conversions, isLoading: conversionsLoading, error: conversionsError, updateData: setConversions } = useOfflineSync<Conversion[]>('pipeline_conversions', fetchPipelineConversions, []);

    const isLoading = inquiriesLoading || quotesLoading || oppsLoading || prospectsLoading || interactionsLoading || conversionsLoading;
    const error = inquiriesError || quotesError || oppsError || prospectsError || interactionsError || conversionsError;

    // Filter all data by the current user's agency
    const agencyOpportunities = useMemo(() => opportunities.filter(o => o.agencyId === agencyId), [opportunities, agencyId]);
    const agencyProspects = useMemo(() => prospects.filter(p => p.agencyId === agencyId), [prospects, agencyId]);
    const agencyInteractions = useMemo(() => interactions.filter(i => i.agencyId === agencyId), [interactions, agencyId]);

    const createOpportunity = useCallback((inquiry: TransactionInquiry) => {
        if (!agencyId || !agentId) return;

        // 1. Create a new Prospect
        const newProspect: Prospect = {
            id: `prospect_${Date.now()}`,
            agencyId,
            ...inquiry.contact
        };
        // FIX: The updateData function from useOfflineSync expects the new array directly, not a callback.
        setProspects([...prospects, newProspect]);

        // 2. Create a new Opportunity
        const newOpportunity: Opportunity__EXT = {
            id: `opp_${Date.now()}`,
            title: `New Opportunity for ${inquiry.contact.firstName} ${inquiry.contact.lastName}`,
            value: 0,
            prospectId: newProspect.id,
            stage: 'new',
            nextFollowUpDate: null,
            agentId,
            agencyId,
            inquiryId: inquiry.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        // FIX: The updateData function from useOfflineSync expects the new array directly, not a callback.
        setOpportunities([...opportunities, newOpportunity]);

    }, [agencyId, agentId, setOpportunities, setProspects, opportunities, prospects]);
    
    const updateOpportunityStage = useCallback((opportunityId: string, newStage: OpportunityStage) => {
        let updatedOpportunity: Opportunity__EXT | null = null;
        const newOpportunities = opportunities.map(opp => {
            if (opp.id === opportunityId) {
                updatedOpportunity = { ...opp, stage: newStage, updatedAt: new Date().toISOString() };
                return updatedOpportunity;
            }
            return opp;
        });

        setOpportunities(newOpportunities);

        // If stage is 'won', log a conversion event
        if (newStage === 'won' && updatedOpportunity) {
            const newConversion: Conversion = {
                date: new Date().toISOString(),
                kind: 'won',
                value: updatedOpportunity.value,
                attributionId: updatedOpportunity.inquiryId, // Simplified linking
            };
            // FIX: The updateData function from useOfflineSync expects the new array directly, not a callback.
            setConversions([...conversions, newConversion]);
        }
    }, [opportunities, setOpportunities, setConversions, conversions]);

    const addInteraction = useCallback((interactionData: Omit<Interaction, 'id' | 'agentId' | 'agencyId' | 'createdAt'>) => {
        if (!agencyId || !agentId) return;

        const newInteraction: Interaction = {
            id: `int_${Date.now()}`,
            ...interactionData,
            agentId,
            agencyId,
            createdAt: new Date().toISOString()
        };
        // FIX: The updateData function from useOfflineSync expects the new array directly, not a callback.
        setInteractions([...interactions, newInteraction]);
    }, [agencyId, agentId, setInteractions, interactions]);


    return {
        inquiries,
        quoteRequests,
        opportunities: agencyOpportunities,
        prospects: agencyProspects,
        interactions: agencyInteractions,
        conversions,
        isLoading,
        error,
        createOpportunity,
        updateOpportunityStage,
        addInteraction
    };
};