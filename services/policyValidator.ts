
import { DetailedPolicy } from '../types';

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export const validatePolicyData = (policy: DetailedPolicy): ValidationResult => {
    const errors: Record<string, string> = {};

    if (!policy.policyNumber || policy.policyNumber.trim() === '') {
        errors.policyNumber = 'Policy Number is required.';
    }

    if (!policy.insurer || policy.insurer.trim() === '') {
        errors.insurer = 'Insurer name is required.';
    }

    if (!policy.policyholder || !policy.policyholder.name || policy.policyholder.name.trim() === '') {
        errors['policyholder.name'] = 'Policyholder name is required.';
    }

    // Check for valid dates if present
    if (policy.effectiveDate && isNaN(Date.parse(policy.effectiveDate))) {
        errors.effectiveDate = 'Invalid Effective Date format.';
    }

    if (policy.expirationDate && isNaN(Date.parse(policy.expirationDate))) {
        errors.expirationDate = 'Invalid Expiration Date format.';
    }

    if (policy.effectiveDate && policy.expirationDate) {
        if (new Date(policy.effectiveDate) > new Date(policy.expirationDate)) {
            errors.expirationDate = 'Expiration date cannot be before effective date.';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
