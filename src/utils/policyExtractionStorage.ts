import type { ExtractedPolicyData, PolicyExtractionResponse, DocumentRecord } from '../../types';

// LocalStorage keys
const STORAGE_PREFIX = 'policy_extraction_';
const CURRENT_EXTRACTION_KEY = `${STORAGE_PREFIX}current`;
const EXTRACTION_HISTORY_KEY = `${STORAGE_PREFIX}history`;
const MAX_HISTORY_ITEMS = 10;

/**
 * Save extracted policy data to localStorage
 * @param data - Extracted policy data from AI processing
 * @param documentRecord - Document metadata
 */
export const saveExtractionData = (
  data: ExtractedPolicyData,
  documentRecord: DocumentRecord
): boolean => {
  try {
    const extractionData: PolicyExtractionResponse = {
      extractedData: data,
      documentRecord
    };

    // Save as current extraction
    localStorage.setItem(CURRENT_EXTRACTION_KEY, JSON.stringify(extractionData));

    // Add to history
    addToHistory(extractionData);

    return true;
  } catch (error) {
    console.error('Error saving extraction data:', error);
    return false;
  }
};

/**
 * Get current extraction data from localStorage
 * @returns Extracted policy data or null if not found
 */
export const getCurrentExtraction = (): PolicyExtractionResponse | null => {
  try {
    const data = localStorage.getItem(CURRENT_EXTRACTION_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data) as PolicyExtractionResponse;

    // Validate structure
    if (!parsed.extractedData || !parsed.extractedData.policy) {
      console.warn('Invalid extraction data structure');
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error retrieving extraction data:', error);
    return null;
  }
};

/**
 * Clear current extraction data
 */
export const clearCurrentExtraction = (): boolean => {
  try {
    localStorage.removeItem(CURRENT_EXTRACTION_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing extraction data:', error);
    return false;
  }
};

/**
 * Update specific fields in current extraction
 * @param updates - Partial updates to apply
 */
export const updateExtractionData = (
  updates: Partial<ExtractedPolicyData>
): boolean => {
  try {
    const current = getCurrentExtraction();
    if (!current) {
      console.warn('No current extraction to update');
      return false;
    }

    // Merge updates
    current.extractedData = {
      ...current.extractedData,
      ...updates
    };

    localStorage.setItem(CURRENT_EXTRACTION_KEY, JSON.stringify(current));
    return true;
  } catch (error) {
    console.error('Error updating extraction data:', error);
    return false;
  }
};

/**
 * Update policy holder information
 */
export const updatePolicyHolder = (
  updates: Partial<ExtractedPolicyData['policyHolder']>
): boolean => {
  try {
    const current = getCurrentExtraction();
    if (!current) return false;

    current.extractedData.policyHolder = {
      ...current.extractedData.policyHolder,
      ...updates
    };

    localStorage.setItem(CURRENT_EXTRACTION_KEY, JSON.stringify(current));
    return true;
  } catch (error) {
    console.error('Error updating policy holder:', error);
    return false;
  }
};

/**
 * Update policy information
 */
export const updatePolicyData = (
  updates: Partial<ExtractedPolicyData['policy']>
): boolean => {
  try {
    const current = getCurrentExtraction();
    if (!current) return false;

    current.extractedData.policy = {
      ...current.extractedData.policy,
      ...updates
    };

    localStorage.setItem(CURRENT_EXTRACTION_KEY, JSON.stringify(current));
    return true;
  } catch (error) {
    console.error('Error updating policy data:', error);
    return false;
  }
};

/**
 * Update beneficiaries
 */
export const updateBeneficiaries = (
  beneficiaries: ExtractedPolicyData['beneficiaries']
): boolean => {
  try {
    const current = getCurrentExtraction();
    if (!current) return false;

    current.extractedData.beneficiaries = beneficiaries;

    localStorage.setItem(CURRENT_EXTRACTION_KEY, JSON.stringify(current));
    return true;
  } catch (error) {
    console.error('Error updating beneficiaries:', error);
    return false;
  }
};

/**
 * Update coverages
 */
export const updateCoverages = (
  coverages: ExtractedPolicyData['coverages']
): boolean => {
  try {
    const current = getCurrentExtraction();
    if (!current) return false;

    current.extractedData.coverages = coverages;

    localStorage.setItem(CURRENT_EXTRACTION_KEY, JSON.stringify(current));
    return true;
  } catch (error) {
    console.error('Error updating coverages:', error);
    return false;
  }
};

/**
 * Add extraction to history
 */
function addToHistory(extraction: PolicyExtractionResponse): void {
  try {
    const historyData = localStorage.getItem(EXTRACTION_HISTORY_KEY);
    let history: PolicyExtractionResponse[] = historyData
      ? JSON.parse(historyData)
      : [];

    // Add to beginning of array
    history.unshift(extraction);

    // Limit history size
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(EXTRACTION_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error adding to history:', error);
  }
}

/**
 * Get extraction history
 * @returns Array of previous extractions
 */
export const getExtractionHistory = (): PolicyExtractionResponse[] => {
  try {
    const data = localStorage.getItem(EXTRACTION_HISTORY_KEY);
    if (!data) return [];

    return JSON.parse(data) as PolicyExtractionResponse[];
  } catch (error) {
    console.error('Error retrieving extraction history:', error);
    return [];
  }
};

/**
 * Clear all extraction history
 */
export const clearExtractionHistory = (): boolean => {
  try {
    localStorage.removeItem(EXTRACTION_HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing extraction history:', error);
    return false;
  }
};

/**
 * Get summary of current extraction
 */
export const getExtractionSummary = (): {
  policyNumber: string;
  policyHolder: string;
  policyType: string;
  insurer: string;
  coveragesCount: number;
  beneficiariesCount: number;
} | null => {
  try {
    const current = getCurrentExtraction();
    if (!current) return null;

    const { extractedData } = current;

    return {
      policyNumber: extractedData.policy.policyNumber,
      policyHolder: `${extractedData.policyHolder.firstName} ${extractedData.policyHolder.lastName}`,
      policyType: extractedData.policy.policyType,
      insurer: extractedData.policy.insurer,
      coveragesCount: extractedData.coverages?.length || 0,
      beneficiariesCount: extractedData.beneficiaries?.length || 0
    };
  } catch (error) {
    console.error('Error getting extraction summary:', error);
    return null;
  }
};

/**
 * Validate extraction data completeness
 * @returns Validation result with any missing required fields
 */
export const validateExtractionData = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  try {
    const current = getCurrentExtraction();
    if (!current) {
      return { isValid: false, errors: ['No extraction data found'] };
    }

    const { extractedData } = current;

    // Validate policy holder
    if (!extractedData.policyHolder.firstName) {
      errors.push('Policy holder first name is required');
    }
    if (!extractedData.policyHolder.lastName) {
      errors.push('Policy holder last name is required');
    }

    // Validate policy
    if (!extractedData.policy.policyNumber) {
      errors.push('Policy number is required');
    }
    if (!extractedData.policy.insurer) {
      errors.push('Insurer name is required');
    }
    if (!extractedData.policy.effectiveDate) {
      errors.push('Effective date is required');
    }
    if (!extractedData.policy.expirationDate) {
      errors.push('Expiration date is required');
    }

    // Validate beneficiaries allocation (should total 100% for each type)
    if (extractedData.beneficiaries && extractedData.beneficiaries.length > 0) {
      const primaryTotal = extractedData.beneficiaries
        .filter(b => b.beneficiaryType === 'primary')
        .reduce((sum, b) => sum + b.allocationPercentage, 0);

      const contingentTotal = extractedData.beneficiaries
        .filter(b => b.beneficiaryType === 'contingent')
        .reduce((sum, b) => sum + b.allocationPercentage, 0);

      if (primaryTotal > 0 && Math.abs(primaryTotal - 100) > 0.01) {
        errors.push(`Primary beneficiaries allocation is ${primaryTotal}%, should be 100%`);
      }

      if (contingentTotal > 0 && Math.abs(contingentTotal - 100) > 0.01) {
        errors.push(`Contingent beneficiaries allocation is ${contingentTotal}%, should be 100%`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Error validating extraction data:', error);
    return {
      isValid: false,
      errors: ['Validation error occurred']
    };
  }
};

/**
 * Check if extraction data exists
 */
export const hasCurrentExtraction = (): boolean => {
  return getCurrentExtraction() !== null;
};

/**
 * Get extracted policy data for API submission
 */
export const getExtractionForSync = (): {
  extractedData: ExtractedPolicyData;
  documentRecord: DocumentRecord;
} | null => {
  const current = getCurrentExtraction();
  if (!current) return null;

  return {
    extractedData: current.extractedData,
    documentRecord: current.documentRecord
  };
};

/**
 * Mark extraction as synced
 */
export const markAsSynced = (customerId: number, policyId: number): boolean => {
  try {
    const current = getCurrentExtraction();
    if (!current) return false;

    // Add sync metadata
    const syncedData = {
      ...current,
      syncedAt: new Date().toISOString(),
      customerId,
      policyId
    };

    // Move to history
    addToHistory(syncedData as any);

    // Clear current
    clearCurrentExtraction();

    return true;
  } catch (error) {
    console.error('Error marking as synced:', error);
    return false;
  }
};
