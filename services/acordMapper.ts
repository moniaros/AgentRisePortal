import { DetailedPolicy, PolicyACORD, CoverageDetailACORD, Policy, PolicyType, Coverage } from '../types';

/**
 * Maps the internal DetailedPolicy representation to a structured PolicyACORD format.
 * This standardizes the policy data before it's stored.
 * @param policy The parsed policy data from the application.
 * @returns A structured PolicyACORD object.
 */
export const mapToPolicyACORD = (policy: DetailedPolicy): PolicyACORD => {
    // In a real app, this would be more complex, handling various policy types and extracting more fields.
    const primaryItem = policy.insuredItems[0] || { coverages: [] };

    const coverages: CoverageDetailACORD[] = primaryItem.coverages.map(cov => ({
        type: cov.type,
        limit: cov.limit,
        deductible: cov.deductible,
        premium: cov.premium,
    }));

    // Use dates from parsed policy if available, otherwise create placeholders.
    const effectiveDate = policy.effectiveDate ? new Date(policy.effectiveDate).toISOString() : new Date().toISOString();
    const expirationDate = policy.expirationDate ? new Date(policy.expirationDate).toISOString() : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

    const acordPolicy: PolicyACORD = {
        id: policy.policyNumber, // Use policy number as a unique ID for simplicity.
        policyNumber: policy.policyNumber,
        insurer: {
            name: policy.insurer,
        },
        policyholder: {
            name: policy.policyholder.name,
            address: policy.policyholder.address,
        },
        effectiveDate,
        expirationDate,
        coverages,
        totalPremium: coverages.reduce((sum, cov) => sum + (cov.premium || 0), 0),
        lastUpdated: new Date().toISOString(),
        beneficiaries: [], // Placeholder
        vehicle: undefined, // Placeholder
    };

    return acordPolicy;
};

/**
 * Maps a stored PolicyACORD object back to the internal CRM Policy format.
 * @param acordPolicy The policy data from localStorage.
 * @returns A Policy object compatible with the CRM state.
 */
export const mapAcordToCrmPolicy = (acordPolicy: PolicyACORD): Policy => {
    const determinePolicyType = (coverages: CoverageDetailACORD[]): PolicyType => {
        const coverageTypes = coverages.map(c => c.type.toLowerCase());
        if (acordPolicy.vehicle) return PolicyType.AUTO;
        if (coverageTypes.some(t => t.includes('liability') || t.includes('collision') || t.includes('σωματικές') || t.includes('υλικές'))) {
            return PolicyType.AUTO;
        }
        if (coverageTypes.some(t => t.includes('dwelling') || t.includes('property'))) {
            return PolicyType.HOME;
        }
        return PolicyType.AUTO; // Default fallback
    };

    const crmCoverages: Coverage[] = acordPolicy.coverages.map(ac => ({
        type: ac.type,
        limit: ac.limit,
        deductible: ac.deductible,
        premium: ac.premium,
    }));

    const crmPolicy: Policy = {
        id: acordPolicy.id,
        type: determinePolicyType(acordPolicy.coverages),
        policyNumber: acordPolicy.policyNumber,
        premium: acordPolicy.totalPremium,
        startDate: acordPolicy.effectiveDate.split('T')[0],
        endDate: acordPolicy.expirationDate.split('T')[0],
        isActive: new Date(acordPolicy.expirationDate) > new Date(),
        insurer: acordPolicy.insurer.name,
        coverages: crmCoverages,
        beneficiaries: acordPolicy.beneficiaries,
        vehicle: acordPolicy.vehicle,
    };

    return crmPolicy;
};
