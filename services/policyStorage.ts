import { PolicyACORD } from '../types';

const STORAGE_KEY = 'agentos_acord_policies';
const CURRENT_VERSION = 1;

interface CustomerPolicies {
    version: number;
    lastUpdated: string;
    policies: PolicyACORD[];
}

interface StoredPolicies {
    [customerId: string]: CustomerPolicies;
}

/**
 * Retrieves and parses all stored policy data from localStorage.
 * Handles potential parsing errors and data versioning.
 * @returns The main storage object containing all customers' policies.
 */
const getStoredData = (): StoredPolicies => {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (!rawData) {
            return {};
        }
        const parsedData = JSON.parse(rawData);
        // In a real app, you might run a migration script here if parsedData.version < CURRENT_VERSION
        return parsedData || {};
    } catch (error) {
        console.error("Error reading from policy storage:", error);
        // If data is corrupted, clear it to prevent further errors.
        localStorage.removeItem(STORAGE_KEY);
        return {};
    }
};

/**
 * Saves the main storage object to localStorage.
 * @param data The complete policy storage object.
 */
const saveStoredData = (data: StoredPolicies): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Error writing to policy storage:", error);
    }
};

/**
 * Retrieves all stored policies for a specific customer.
 * @param customerId The ID of the customer.
 * @returns An array of PolicyACORD objects.
 */
export const getPoliciesForCustomer = (customerId: string): PolicyACORD[] => {
    const data = getStoredData();
    return data[customerId]?.policies || [];
};

/**
 * Saves or updates a policy for a specific customer (upsert).
 * @param customerId The ID of the customer.
 * @param newPolicy The policy object to save.
 */
export const savePolicyForCustomer = (customerId: string, newPolicy: PolicyACORD): void => {
    const allData = getStoredData();
    const customerData = allData[customerId] || {
        version: CURRENT_VERSION,
        lastUpdated: new Date().toISOString(),
        policies: [],
    };

    const policyIndex = customerData.policies.findIndex(p => p.id === newPolicy.id);
    if (policyIndex > -1) {
        // Update existing policy
        customerData.policies[policyIndex] = newPolicy;
    } else {
        // Add new policy
        customerData.policies.push(newPolicy);
    }

    customerData.lastUpdated = new Date().toISOString();
    allData[customerId] = customerData;

    saveStoredData(allData);
};

/**
 * Deletes a policy for a specific customer.
 * @param customerId The ID of the customer.
 * @param policyId The ID of the policy to delete.
 */
export const deletePolicyForCustomer = (customerId: string, policyId: string): void => {
    const allData = getStoredData();
    const customerData = allData[customerId];

    if (customerData) {
        customerData.policies = customerData.policies.filter(p => p.id !== policyId);
        customerData.lastUpdated = new Date().toISOString();
        allData[customerId] = customerData;
        saveStoredData(allData);
    }
};
