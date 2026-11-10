import { AutomationRule, Lead, ConditionResult, SimulationResult, RuleCondition } from '../types';

export interface RuleEvaluationContext extends Lead {
    daysToRenewal?: number;
}

const evaluateCondition = (
    condition: RuleCondition,
    lead: RuleEvaluationContext
): { passed: boolean; actualValue: unknown } => {
    let actualValue: unknown;
    let passed = false;

    const strEquals = (a: unknown, b: unknown) =>
        String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();

    switch (condition.field) {
        case 'lead_status':
            actualValue = lead.status;
            if (condition.operator === 'is') passed = strEquals(actualValue, condition.value);
            if (condition.operator === 'is_not') passed = !strEquals(actualValue, condition.value);
            break;

        case 'policy_interest':
            actualValue = lead.policyType;
            if (condition.operator === 'is') passed = strEquals(actualValue, condition.value);
            if (condition.operator === 'is_not') passed = !strEquals(actualValue, condition.value);
            break;

        case 'lead_source':
            actualValue = lead.source || '';
            if (condition.operator === 'is') passed = strEquals(actualValue, condition.value);
            if (condition.operator === 'is_not') passed = !strEquals(actualValue, condition.value);
            if (condition.operator === 'contains') {
                passed = String(actualValue).toLowerCase().includes(String(condition.value ?? '').toLowerCase());
            }
            break;

        case 'lead_score':
        case 'potential_value':
        case 'days_to_renewal': {
            actualValue =
                condition.field === 'lead_score'
                    ? lead.score
                    : condition.field === 'potential_value'
                      ? lead.potentialValue
                      : lead.daysToRenewal;

            if (actualValue === undefined || actualValue === null) {
                return { passed: false, actualValue: 'N/A' };
            }
            const actualNum = Number(actualValue);
            const targetNum = Number(condition.value);
            if (Number.isNaN(actualNum) || Number.isNaN(targetNum)) {
                return { passed: false, actualValue };
            }
            if (condition.operator === 'equals') passed = actualNum === targetNum;
            if (condition.operator === 'greater_than') passed = actualNum > targetNum;
            if (condition.operator === 'less_than') passed = actualNum < targetNum;
            break;
        }
    }
    return { passed, actualValue };
};

export const simulateRule = (rule: AutomationRule, lead: RuleEvaluationContext): SimulationResult => {
    if (!rule.conditions || rule.conditions.length === 0) {
        return {
            conditionsMet: true,
            conditionResults: [],
        };
    }

    const conditionResults: ConditionResult[] = rule.conditions.map((condition) => {
        const { passed, actualValue } = evaluateCondition(condition, lead);
        return { condition, passed, actualValue };
    });

    const logicalOp = rule.logicalOperator || 'AND';
    const conditionsMet =
        logicalOp === 'OR'
            ? conditionResults.some((result) => result.passed)
            : conditionResults.every((result) => result.passed);

    return { conditionsMet, conditionResults };
};

export const renderTemplateContent = (
    rawContent: string,
    lead: Pick<Lead, 'firstName' | 'lastName' | 'email' | 'phone' | 'policyType' | 'potentialValue'>
): string => {
    return rawContent
        .replace(/\{\{\s*Lead\.FirstName\s*\}\}/gi, lead.firstName || 'Client')
        .replace(/\{\{\s*Lead\.LastName\s*\}\}/gi, lead.lastName || '')
        .replace(/\{\{\s*Lead\.Email\s*\}\}/gi, lead.email || '')
        .replace(/\{\{\s*Lead\.Phone\s*\}\}/gi, lead.phone || '')
        .replace(/\{\{\s*Lead\.PolicyType\s*\}\}/gi, String(lead.policyType || '').toUpperCase())
        .replace(/\{\{\s*Lead\.PotentialValue\s*\}\}/gi, `€${Number(lead.potentialValue || 0).toLocaleString()}`);
};
