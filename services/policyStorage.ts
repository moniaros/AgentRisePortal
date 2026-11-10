import { Policy, PolicyACORD, PolicyType, Customer } from '../types';
import { broadcastStoreUpdate } from '../hooks/useOfflineSync';

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

function inferPolicyType(acord: PolicyACORD): PolicyType {
    const text = `${acord.policyNumber} ${acord.coverages.map((c) => c.type).join(' ')}`.toLowerCase();
    if (acord.vehicle || text.includes('auto') || text.includes('car') || text.includes('bodily') || text.includes('οδική')) {
        return PolicyType.AUTO;
    }
    if (text.includes('home') || text.includes('fire') || text.includes('earthquake') || text.includes('κατοικ') || text.includes('σεισμ')) {
        return PolicyType.HOME;
    }
    if (text.includes('health') || text.includes('hospital') || text.includes('υγεία') || text.includes('νοσοκομ')) {
        return PolicyType.HEALTH;
    }
    return PolicyType.LIFE;
}

function syncPolicySummaryIntoCrmCustomer(customerId: string, acordPolicy: PolicyACORD, remove = false): void {
    try {
        const raw = localStorage.getItem('agentos_db_customers') ?? localStorage.getItem('customers_data');
        if (!raw) return;
        const customers: Customer[] = JSON.parse(raw);
        const idx = customers.findIndex((c) => c.id === customerId);
        if (idx === -1) return;

        const target = customers[idx];
        let nextPolicies: Policy[];

        if (remove) {
            nextPolicies = target.policies.filter(
                (p) => p.id !== acordPolicy.id && p.policyNumber !== acordPolicy.policyNumber
            );
        } else {
            const summaryPolicy: Policy = {
                id: acordPolicy.id,
                type: inferPolicyType(acordPolicy),
                policyNumber: acordPolicy.policyNumber,
                premium: acordPolicy.totalPremium || 0,
                startDate: acordPolicy.effectiveDate,
                endDate: acordPolicy.expirationDate,
                isActive: new Date(acordPolicy.expirationDate).getTime() >= Date.now() - 86_400_000 * 30,
                insurer: acordPolicy.insurer.name,
                coverages: acordPolicy.coverages.map((c) => ({
                    type: c.type,
                    limit: c.limit,
                    deductible: c.deductible,
                    premium: c.premium,
                })),
                beneficiaries: acordPolicy.beneficiaries,
                vehicle: acordPolicy.vehicle,
            };

            const existingIdx = target.policies.findIndex(
                (p) => p.id === summaryPolicy.id || p.policyNumber === summaryPolicy.policyNumber
            );
            if (existingIdx > -1) {
                nextPolicies = target.policies.map((p, i) => (i === existingIdx ? summaryPolicy : p));
            } else {
                nextPolicies = [...target.policies, summaryPolicy];
            }
        }

        const updatedCustomers = customers.map((c, i) =>
            i === idx ? { ...c, policies: nextPolicies } : c
        );
        broadcastStoreUpdate('agentos_db_customers', updatedCustomers);
    } catch (err) {
        console.warn('Policy CRM sync warning:', err);
    }
}

export const getStoredData = (): StoredPolicies => {
    try {
        const rawData = localStorage.getItem(STORAGE_KEY);
        if (!rawData) {
            return {};
        }
        const parsedData = JSON.parse(rawData);
        return parsedData || {};
    } catch (error) {
        console.error('Error reading from policy storage:', error);
        localStorage.removeItem(STORAGE_KEY);
        return {};
    }
};

const saveStoredData = (data: StoredPolicies): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('agentos:policies-updated', { detail: data }));
        }
    } catch (error) {
        console.error('Error writing to policy storage:', error);
    }
};

export const getPoliciesForCustomer = (customerId: string): PolicyACORD[] => {
    const data = getStoredData();
    return data[customerId]?.policies || [];
};

export const savePolicyForCustomer = (customerId: string, newPolicy: PolicyACORD): void => {
    const allData = getStoredData();
    const customerData = allData[customerId] || {
        version: CURRENT_VERSION,
        lastUpdated: new Date().toISOString(),
        policies: [],
    };

    const policyIndex = customerData.policies.findIndex((p) => p.id === newPolicy.id);
    if (policyIndex > -1) {
        customerData.policies[policyIndex] = newPolicy;
    } else {
        customerData.policies.push(newPolicy);
    }

    customerData.lastUpdated = new Date().toISOString();
    allData[customerId] = customerData;

    saveStoredData(allData);
    syncPolicySummaryIntoCrmCustomer(customerId, newPolicy, false);
};

export const deletePolicyForCustomer = (customerId: string, policyId: string): void => {
    const allData = getStoredData();
    const customerData = allData[customerId];

    if (customerData) {
        const target = customerData.policies.find((p) => p.id === policyId);
        customerData.policies = customerData.policies.filter((p) => p.id !== policyId);
        customerData.lastUpdated = new Date().toISOString();
        allData[customerId] = customerData;
        saveStoredData(allData);
        if (target) {
            syncPolicySummaryIntoCrmCustomer(customerId, target, true);
        }
    }
};