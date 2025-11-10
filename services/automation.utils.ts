import { RuleDefinition } from '../types';

/**
 * Calculates the difference in days between two dates, ignoring the time component.
 */
export const dayDifference = (date1: Date, date2: Date): number => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc2 - utc1) / msPerDay);
};

/**
 * Replaces placeholders in a template string with actual data.
 * E.g., "Hello {customer.name}" becomes "Hello John Doe"
 */
export const renderTemplate = (template: string, data: Record<string, any>): string => {
    let rendered = template;
    // Regex to find all {key} or {nested.key} placeholders
    const regex = /\{([^}]+)\}/g;
    
    rendered = rendered.replace(regex, (match, key) => {
        // Access nested properties like 'customer.firstName'
        const value = key.split('.').reduce((o: any, i: string) => (o ? o[i] : undefined), data);
        return value !== undefined ? String(value) : match;
    });
    return rendered;
};

/**
 * Evaluates if a set of conditions are met for a given context object.
 */
export const evaluateConditions = (conditions: RuleDefinition['conditions'], context: any): boolean => {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
        // Dot notation accessor for nested fields like 'policy.type'
        const value = condition.field.split('.').reduce((o, i) => (o ? o[i] : undefined), context);

        switch (condition.operator) {
            case 'EQUALS':
                return value === condition.value;
            case 'NOT_EQUALS':
                return value !== condition.value;
            case 'GREATER_THAN':
                return value > condition.value;
            case 'LESS_THAN':
                 return value < condition.value;
            default:
                console.warn(`[Rules Engine] Unknown operator: ${condition.operator}`);
                return false;
        }
    });
};
