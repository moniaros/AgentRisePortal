
import { StoredFinding, GapAnalysisResult, FindingStatus, FindingType } from '../types';
import { useAuth } from '../hooks/useAuth';

const getStorageKey = (agencyId: string) => `agentos_findings_${agencyId}`;

/**
 * Retrieves and parses all stored findings from localStorage for a given agency.
 * @param agencyId The ID of the agency.
 * @returns An array of StoredFinding objects.
 */
export const getStoredFindings = (agencyId: string): StoredFinding[] => {
    try {
        const rawData = localStorage.getItem(getStorageKey(agencyId));
        return rawData ? JSON.parse(rawData) : [];
    } catch (error) {
        console.error("Error reading findings from storage:", error);
        localStorage.removeItem(getStorageKey(agencyId));
        return [];
    }
};

/**
 * Saves the main findings array to localStorage for a given agency.
 * @param agencyId The ID of the agency.
 * @param findings The complete array of findings.
 */
const saveStoredFindings = (agencyId: string, findings: StoredFinding[]): void => {
    try {
        localStorage.setItem(getStorageKey(agencyId), JSON.stringify(findings));
    } catch (error) {
        console.error("Error writing findings to storage:", error);
    }
};

/**
 * Helper to parse value string (e.g. "€200/year") into a number (200).
 */
const parseValue = (str?: string): number => {
    if (!str) return 0;
    const matches = str.match(/[\d,.]+/);
    if (matches) {
        return parseFloat(matches[0].replace(/,/g, '')); 
    }
    return 0;
};

/**
 * Saves new findings from a gap analysis result with 'pending_review' status.
 * @param customerId The ID of the customer.
 * @param analysisId A unique ID for the analysis session.
 * @param result The GapAnalysisResult object from the AI.
 */
export const savePendingFindings = (customerId: string, analysisId: string, result: GapAnalysisResult): void => {
    // This is a bit of a hack to get the agencyId without passing it down.
    // In a real app with a proper backend, this wouldn't be necessary.
    const agencyId = JSON.parse(sessionStorage.getItem('currentUser') || '{}')?.agencyId;
    if (!agencyId) {
        console.error("Cannot save findings: agencyId not found.");
        return;
    }

    const allFindings = getStoredFindings(agencyId);
    const newFindings: StoredFinding[] = [];

    const createFinding = (type: FindingType, item: any): StoredFinding => ({
        id: `finding_${type}_${Date.now()}_${Math.random()}`,
        customerId,
        agencyId,
        createdAt: new Date().toISOString(),
        type,
        status: 'pending_review',
        title: item.product || item.area,
        description: item.recommendation || item.reason,
        benefit: item.benefit,
        originalAnalysisId: analysisId,
        priority: item.priority,
        financialImpact: item.financialImpact,
        costOfImplementation: item.costOfImplementation,
        estimatedValue: parseValue(item.costOfImplementation),
        salesScript: item.salesScript
    });

    result.gaps.forEach(item => newFindings.push(createFinding('gap', item)));
    result.upsell_opportunities.forEach(item => newFindings.push(createFinding('upsell', item)));
    result.cross_sell_opportunities.forEach(item => newFindings.push(createFinding('cross-sell', item)));
    
    saveStoredFindings(agencyId, [...allFindings, ...newFindings]);
};

/**
 * Updates the status of a specific finding.
 * @param agencyId The ID of the agency.
 * @param findingId The ID of the finding to update.
 * @param newStatus The new status to set.
 */
export const updateFindingStatusInStorage = (agencyId: string, findingId: string, newStatus: FindingStatus): void => {
    const allFindings = getStoredFindings(agencyId);
    const updatedFindings = allFindings.map(f =>
        f.id === findingId ? { ...f, status: newStatus } : f
    );
    saveStoredFindings(agencyId, updatedFindings);
};

/**
 * Updates the content of a specific finding.
 * @param agencyId The ID of the agency.
 * @param findingId The ID of the finding to update.
 * @param newContent The new content for the finding.
 */
export const updateFindingContentInStorage = (agencyId: string, findingId: string, newContent: { title: string; description: string; benefit?: string }): void => {
    const allFindings = getStoredFindings(agencyId);
    const updatedFindings = allFindings.map(f =>
        f.id === findingId ? { ...f, ...newContent } : f
    );
    saveStoredFindings(agencyId, updatedFindings);
};

/**
 * Retrieves all verified opportunities (upsell/cross-sell) for an agency.
 * Used for dashboard KPIs.
 * @param agencyId The ID of the agency.
 * @returns An object with counts of upsell and cross-sell opportunities.
 */
export const getAllVerifiedOpportunitiesForAgency = (agencyId: string): { upsell: number; crossSell: number } => {
    const allFindings = getStoredFindings(agencyId);
    return allFindings.reduce(
        (acc, finding) => {
            if (finding.status === 'verified') {
                if (finding.type === 'upsell') acc.upsell++;
                if (finding.type === 'cross-sell') acc.crossSell++;
            }
            return acc;
        },
        { upsell: 0, crossSell: 0 }
    );
};
