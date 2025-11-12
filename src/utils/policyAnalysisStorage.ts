/**
 * AI Policy Analysis Storage Utility
 * Manages storage and retrieval of AI-generated policy analysis data
 */

export interface PolicyGap {
  id: string;
  area: string;
  current: string;
  recommended: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  verified?: 'confirmed' | 'rejected' | 'review';
  agentNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface UpsellOpportunity {
  id: string;
  product: string;
  recommendation: string;
  benefit: string;
  estimatedPremium?: number;
  priority: 'high' | 'medium' | 'low';
  verified?: 'confirmed' | 'rejected' | 'review';
  agentNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface CrossSellOpportunity {
  id: string;
  product: string;
  recommendation: string;
  benefit: string;
  estimatedPremium?: number;
  priority: 'high' | 'medium' | 'low';
  verified?: 'confirmed' | 'rejected' | 'review';
  agentNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface PolicyAnalysis {
  customerId: string;
  analyzedAt: string;
  source: 'ai_policy_analysis';
  gaps: PolicyGap[];
  upsellOpportunities: UpsellOpportunity[];
  crossSellOpportunities: CrossSellOpportunity[];
}

const STORAGE_KEY_PREFIX = 'ai_policy_analysis_';

/**
 * Save policy analysis to localStorage
 */
export const savePolicyAnalysis = (customerId: string, analysis: Omit<PolicyAnalysis, 'customerId'>): boolean => {
  try {
    const data: PolicyAnalysis = {
      customerId,
      ...analysis
    };

    localStorage.setItem(`${STORAGE_KEY_PREFIX}${customerId}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving policy analysis:', error);
    return false;
  }
};

/**
 * Retrieve policy analysis from localStorage
 */
export const getPolicyAnalysis = (customerId: string): PolicyAnalysis | null => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${customerId}`);

    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data) as PolicyAnalysis;

    // Validate structure
    if (!parsed.customerId || !Array.isArray(parsed.gaps) ||
        !Array.isArray(parsed.upsellOpportunities) ||
        !Array.isArray(parsed.crossSellOpportunities)) {
      console.warn('Invalid policy analysis structure');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error retrieving policy analysis:', error);
    return null;
  }
};

/**
 * Update verification status for a specific finding
 */
export const updateFindingVerification = (
  customerId: string,
  findingType: 'gap' | 'upsell' | 'crossSell',
  findingId: string,
  verification: {
    verified: 'confirmed' | 'rejected' | 'review';
    agentNotes?: string;
    verifiedBy: string;
  }
): boolean => {
  try {
    const analysis = getPolicyAnalysis(customerId);

    if (!analysis) {
      return false;
    }

    const now = new Date().toISOString();

    // Find and update the specific finding
    let updated = false;

    if (findingType === 'gap') {
      const gap = analysis.gaps.find(g => g.id === findingId);
      if (gap) {
        gap.verified = verification.verified;
        gap.agentNotes = verification.agentNotes || gap.agentNotes;
        gap.verifiedAt = now;
        gap.verifiedBy = verification.verifiedBy;
        updated = true;
      }
    } else if (findingType === 'upsell') {
      const upsell = analysis.upsellOpportunities.find(u => u.id === findingId);
      if (upsell) {
        upsell.verified = verification.verified;
        upsell.agentNotes = verification.agentNotes || upsell.agentNotes;
        upsell.verifiedAt = now;
        upsell.verifiedBy = verification.verifiedBy;
        updated = true;
      }
    } else if (findingType === 'crossSell') {
      const crossSell = analysis.crossSellOpportunities.find(c => c.id === findingId);
      if (crossSell) {
        crossSell.verified = verification.verified;
        crossSell.agentNotes = verification.agentNotes || crossSell.agentNotes;
        crossSell.verifiedAt = now;
        crossSell.verifiedBy = verification.verifiedBy;
        updated = true;
      }
    }

    if (updated) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${customerId}`, JSON.stringify(analysis));
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error updating finding verification:', error);
    return false;
  }
};

/**
 * Delete policy analysis for a customer
 */
export const deletePolicyAnalysis = (customerId: string): boolean => {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${customerId}`);
    return true;
  } catch (error) {
    console.error('Error deleting policy analysis:', error);
    return false;
  }
};

/**
 * Get all customer IDs with stored analyses
 */
export const getAllAnalysisCustomerIds = (): string[] => {
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
      .map(key => key.replace(STORAGE_KEY_PREFIX, ''));
  } catch (error) {
    console.error('Error getting analysis customer IDs:', error);
    return [];
  }
};

/**
 * Get summary statistics for policy analysis
 */
export const getAnalysisSummary = (customerId: string): {
  totalGaps: number;
  highSeverityGaps: number;
  totalUpsells: number;
  totalCrossSells: number;
  unverifiedCount: number;
} | null => {
  try {
    const analysis = getPolicyAnalysis(customerId);

    if (!analysis) {
      return null;
    }

    const highSeverityGaps = analysis.gaps.filter(g => g.severity === 'high').length;
    const unverifiedCount = [
      ...analysis.gaps,
      ...analysis.upsellOpportunities,
      ...analysis.crossSellOpportunities
    ].filter(item => !item.verified).length;

    return {
      totalGaps: analysis.gaps.length,
      highSeverityGaps,
      totalUpsells: analysis.upsellOpportunities.length,
      totalCrossSells: analysis.crossSellOpportunities.length,
      unverifiedCount
    };
  } catch (error) {
    console.error('Error getting analysis summary:', error);
    return null;
  }
};
