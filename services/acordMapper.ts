import { DetailedPolicy, PolicyACORD, CoverageDetailACORD } from '../types';

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
        // 'premium' is not available in the source DetailedPolicy type.
    }));

    // Placeholder dates as they are not available in the source DetailedPolicy type.
    // A real OCR/parsing step would extract these from the document.
    const effectiveDate = new Date().toISOString();
    const expirationDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

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
        totalPremium: 0, // Not available in DetailedPolicy.
        lastUpdated: new Date().toISOString(),
    };

    return acordPolicy;
};
