import { RuleDefinition } from '../types';

export const dayDifference = (date1: Date, date2: Date): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const renderTemplate = (template: string, data: { [key: string]: any }): string => {
    return template.replace(/\{([^}]+)\}/g, (match, placeholder) => {
        const keys = placeholder.split('.');
        let value = data;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return match; // Return original placeholder if path is invalid
            }
        }
        return String(value);
    });
};

export const evaluateConditions = (conditions: RuleDefinition['conditions'], context: any): boolean => {
    if (!conditions || conditions.length === 0) return true;
    
    return conditions.every(condition => {
        const keys = condition.field.split('.');
        let value = context;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return false; // Field not found
            }
        }

        switch (condition.operator) {
            case 'EQUALS':
                return value == condition.value;
            case 'GREATER_THAN':
                return value > condition.value;
            case 'LESS_THAN':
                return value < condition.value;
            default:
                return false;
        }
    });
};
