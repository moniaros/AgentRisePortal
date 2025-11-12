import { useState, useEffect, useCallback, useMemo } from 'react';
import { StoredFinding, FindingStatus } from '../types';
import { getStoredFindings, updateFindingStatusInStorage, updateFindingContentInStorage } from '../services/findingsStorage';
import { useAuth } from './useAuth';

export const useFindingsData = (customerId: string | undefined) => {
    const { currentUser } = useAuth();
    const agencyId = currentUser?.agencyId;

    const [findings, setFindings] = useState<StoredFinding[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadFindings = useCallback(() => {
        if (!customerId || !agencyId) {
            setFindings([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        // Simulate async in case this becomes an API call
        setTimeout(() => {
            const allAgencyFindings = getStoredFindings(agencyId);
            const customerFindings = allAgencyFindings.filter(f => f.customerId === customerId);
            setFindings(customerFindings);
            setIsLoading(false);
        }, 300);
    }, [customerId, agencyId]);

    useEffect(() => {
        loadFindings();
    }, [loadFindings]);

    const updateFindingStatus = useCallback((findingId: string, newStatus: FindingStatus) => {
        if (!agencyId) return;
        updateFindingStatusInStorage(agencyId, findingId, newStatus);
        loadFindings(); // Re-fetch from storage to update state
    }, [agencyId, loadFindings]);
    
    const updateFindingContent = useCallback((findingId: string, newContent: { title: string, description: string, benefit?: string }) => {
        if (!agencyId) return;
        updateFindingContentInStorage(agencyId, findingId, newContent);
        loadFindings();
    }, [agencyId, loadFindings]);

    const { pendingFindings, verifiedOpportunities } = useMemo(() => {
        const pending: StoredFinding[] = [];
        const verified: StoredFinding[] = [];

        findings.forEach(finding => {
            if (finding.status === 'pending_review') {
                pending.push(finding);
            } else if (finding.status === 'verified' && (finding.type === 'upsell' || finding.type === 'cross-sell')) {
                verified.push(finding);
            }
        });

        return { pendingFindings: pending, verifiedOpportunities: verified };
    }, [findings]);

    return {
        pendingFindings,
        verifiedOpportunities,
        isLoading,
        updateFindingStatus,
        updateFindingContent,
        refreshFindings: loadFindings,
    };
};