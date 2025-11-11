import { AutomationRule, Lead, ConditionResult, SimulationResult, RuleCondition } from '../types';

const evaluateCondition = (condition: RuleCondition, lead: Lead): { passed: boolean; actualValue: any } => {
    let actualValue;
    let passed = false;

    switch (condition.field) {
        case 'lead_status':
            actualValue = lead.status;
            if (condition.operator === 'is') passed = actualValue === condition.value;
            if (condition.operator === 'is_not') passed = actualValue !== condition.value;
            break;
        case 'lead_score':
            actualValue = lead.score;
            if (actualValue === undefined) return { passed: false, actualValue: 'N/A' };
            const conditionValueNum = Number(condition.value);
            if (condition.operator === 'equals') passed = actualValue === conditionValueNum;
            if (condition.operator === 'greater_than') passed = actualValue > conditionValueNum;
            if (condition.operator === 'less_than') passed = actualValue < conditionValueNum;
            break;
        case 'policy_interest':
            actualValue = lead.policyType;
            if (condition.operator === 'is') passed = actualValue === condition.value;
            if (condition.operator === 'is_not') passed = actualValue !== condition.value;
            break;
    }
    return { passed, actualValue };
};

export const simulateRule = (rule: AutomationRule, lead: Lead): SimulationResult => {
    if (!rule.conditions || rule.conditions.length === 0) {
        return {
            conditionsMet: true, // If there are no conditions, the rule should run
            conditionResults: [],
        };
    }

    const conditionResults: ConditionResult[] = rule.conditions.map(condition => {
        const { passed, actualValue } = evaluateCondition(condition, lead);
        return { condition, passed, actualValue };
    });

    const conditionsMet = conditionResults.every(result => result.passed);

    return { conditionsMet, conditionResults };
};
