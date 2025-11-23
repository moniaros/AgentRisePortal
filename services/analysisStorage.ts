
import { StoredAnalysis } from '../types';

const STORAGE_KEY_PREFIX = 'agentos_analysis_';
const MASTER_LIST_KEY = 'agentos_analysis_customers';

const getCustomerStorageKey = (customerId: string) => `${STORAGE_KEY_PREFIX}${customerId}`;

const getMasterList = (): string[] => {
    try {
        const list = localStorage.getItem(MASTER_LIST_KEY);
        return list ? JSON.parse(list) : [];
    } catch {
        return [];
    }
};

const updateMasterList = (customerId: string): void => {
    const list = getMasterList();
    if (!list.includes(customerId)) {
        list.push(customerId);
        localStorage.setItem(MASTER_LIST_KEY, JSON.stringify(list));
    }
};

/**
 * Retrieves all stored analyses for a specific customer.
 * @param customerId The ID of the customer.
 * @returns An array of StoredAnalysis objects.
 */
export const getAnalysesForCustomer = (customerId: string): StoredAnalysis[] => {
    try {
        const rawData = localStorage.getItem(getCustomerStorageKey(customerId));
        return rawData ? JSON.parse(rawData) : [];
    } catch (error) {
        console.error(`Error reading analyses for customer ${customerId}:`, error);
        return [];
    }
};

/**
 * Saves a new analysis for a specific customer.
 * @param customerId The ID of the customer.
 * @param analysis The analysis data to save, without id or createdAt.
 */
export const saveAnalysisForCustomer = (customerId: string, analysis: Omit<StoredAnalysis, 'id' | 'createdAt'>): void => {
    try {
        const existingAnalyses = getAnalysesForCustomer(customerId);
        const newAnalysis: StoredAnalysis = {
            ...analysis,
            id: `analysis_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        const updatedAnalyses = [newAnalysis, ...existingAnalyses];
        localStorage.setItem(getCustomerStorageKey(customerId), JSON.stringify(updatedAnalyses));
        updateMasterList(customerId);
    } catch (error) {
        console.error(`Error saving analysis for customer ${customerId}:`, error);
    }
};