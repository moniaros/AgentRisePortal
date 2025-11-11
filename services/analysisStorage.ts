import { StoredAnalysis, CustomerAnalysisStorage } from '../types';

const STORAGE_KEY = 'agentos_analysis_results';
const CURRENT_VERSION = 1;

/**
 * Retrieves and parses all stored analysis data from localStorage.
 * @returns The main storage object containing all customers' analyses.
 */
const getStoredData = (): CustomerAnalysisStorage => {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (!rawData) {
            return {};
        }
        return JSON.parse(rawData) || {};
    } catch (error) {
        console.error("Error reading from analysis storage:", error);
        localStorage.removeItem(STORAGE_KEY);
        return {};
    }
};

/**
 * Saves the main storage object to localStorage.
 * @param data The complete analysis storage object.
 */
const saveStoredData = (data: CustomerAnalysisStorage): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Error writing to analysis storage:", error);
    }
};

/**
 * Saves a new analysis result for a specific customer.
 * @param customerId The ID (or unique name) of the customer.
 * @param analysisData The analysis data to save.
 */
export const saveAnalysisForCustomer = (
    customerId: string, 
    analysisData: Omit<StoredAnalysis, 'id' | 'createdAt'>
): void => {
    const allData = getStoredData();
    const customerRecord = allData[customerId] || {
        version: CURRENT_VERSION,
        lastUpdated: new Date().toISOString(),
        analyses: [],
    };

    const newAnalysis: StoredAnalysis = {
        ...analysisData,
        id: `analysis_${Date.now()}`,
        createdAt: new Date().toISOString(),
    };

    customerRecord.analyses.push(newAnalysis);
    customerRecord.lastUpdated = new Date().toISOString();
    allData[customerId] = customerRecord;

    saveStoredData(allData);
};

/**
 * Retrieves all stored analyses for a specific customer.
 * @param customerId The ID (or unique name) of the customer.
 * @returns An array of StoredAnalysis objects.
 */
export const getAnalysesForCustomer = (customerId: string): StoredAnalysis[] => {
    const data = getStoredData();
    return data[customerId]?.analyses || [];
};
