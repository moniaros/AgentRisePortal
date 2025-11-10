import { Customer, User, ReminderLogEntry, AutomatedTask, Language, RuleDefinition } from '../types';
import { dayDifference, renderTemplate, evaluateConditions } from './automation.utils';
import { RENEWAL_RULES } from './automationState';

export const runRenewalChecks = async (
    customers: Customer[],
    users: User[],
    existingLogs: ReminderLogEntry[],
    config: { language: Language }
): Promise<{ newTasks: AutomatedTask[], newLogs: ReminderLogEntry[] }> => {
    
    const newTasks: AutomatedTask[] = [];
    const newLogs: ReminderLogEntry[] = [];
    const today = new Date();

    for (const customer of customers) {
        for (const policy of customer.policies) {
            if (!policy.isActive) continue;

            const agent = users.find(u => u.id === customer.assignedAgentId);
            if (!agent) continue;
            
            for (const rule of RENEWAL_RULES) {
                if (!rule.isEnabled) continue;

                if (rule.trigger.eventType === 'POLICY_EXPIRING_SOON') {
                    const daysUntilExpiry = dayDifference(today, new Date(policy.endDate));
                    
                    if (daysUntilExpiry === rule.trigger.parameters.daysBefore) {
                        const logKey = `${rule.id}_${policy.id}`;
                        if (existingLogs.some(log => log.logKey === logKey)) {
                            continue; // Already processed
                        }

                        const context = { customer, policy, agent, expiryDate: policy.endDate };
                        if (evaluateConditions(rule.conditions, context)) {
                            for (const action of rule.actions) {
                                if (action.actionType === 'CREATE_TASK') {
                                    newTasks.push({
                                        id: `task_${Date.now()}`,
                                        message: renderTemplate(action.template, context),
                                        createdAt: new Date().toISOString(),
                                        type: 'renewal'
                                    });
                                }
                            }
                            newLogs.push({ logKey, ruleId: rule.id, policyId: policy.id, sentAt: new Date().toISOString() });
                        }
                    }
                }
            }
        }
    }

    return { newTasks, newLogs };
};
