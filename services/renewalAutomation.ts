
// FIX: Import from correct path
import { Customer, Policy, User, AutomatedTask, ReminderLogEntry, RuleDefinition, Language, EmailTemplate, SmsTemplate } from '../types';

/**
 * Calculates the difference in days between two dates, ignoring the time component.
 */
const dayDifference = (date1: Date, date2: Date): number => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc2 - utc1) / msPerDay);
};

/**
 * Replaces placeholders in a template string with actual data.
 */
const renderTemplate = (template: string, data: Record<string, string>): string => {
    let rendered = template;
    for (const key in data) {
        // FIX: Regex was incorrectly looking for {{...}} instead of {...}.
        const regex = new RegExp(`\\{${key.replace('.', '\\.')}\\}`, 'g');
        rendered = rendered.replace(regex, data[key]);
    }
    return rendered;
};


/**
 * Evaluates if a set of conditions are met for a given context.
 */
const evaluateConditions = (conditions: RuleDefinition['conditions'], context: any): boolean => {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
        // Simple dot notation accessor
        const value = condition.field.split('.').reduce((o, i) => (o ? o[i] : undefined), context);

        switch (condition.operator) {
            case 'EQUALS':
                return value === condition.value;
            // Add other operators as needed
            default:
                return false;
        }
    });
};

/**
 * Simulates a daily check for policies that require renewal reminders based on a set of rules.
 * @returns An array of newly generated AutomatedTask objects.
 */
export const runRenewalChecks = async (
    customers: Customer[],
    users: User[],
    reminderLog: ReminderLogEntry[],
    translations: any
): Promise<{ newTasks: AutomatedTask[], updatedLog: ReminderLogEntry[] }> => {
    
    try {
        // FIX: Fetch JSON data at runtime instead of using static imports which cause module resolution errors.
        const [rulesRes, emailTemplatesRes, smsTemplatesRes] = await Promise.all([
            fetch('/data/rules/renewal-reminders.rules.json'),
            fetch('/data/templates/renewal-email-templates.json'),
            fetch('/data/templates/renewal-sms-templates.json')
        ]);

        if (!rulesRes.ok || !emailTemplatesRes.ok || !smsTemplatesRes.ok) {
            throw new Error('Failed to fetch automation assets');
        }

        const rules: RuleDefinition[] = await rulesRes.json();
        const emailTemplatesData = await emailTemplatesRes.json();
        const smsTemplatesData = await smsTemplatesRes.json();
        
        const emailTemplates: EmailTemplate[] = emailTemplatesData.templates;
        const smsTemplates: SmsTemplate[] = smsTemplatesData.templates;


        const newTasks: AutomatedTask[] = [];
        const today = new Date();
        const userMap = new Map(users.map(u => [u.id, u]));
        const language: Language = translations.language || Language.EL;

        customers.forEach(customer => {
            customer.policies.forEach(policy => {
                if (!policy.isActive) return;

                const expiryDate = new Date(policy.endDate);
                const daysUntilExpiration = dayDifference(today, expiryDate);

                const triggeredRules = rules.filter(rule =>
                    rule.isEnabled &&
                    rule.trigger.eventType === 'POLICY_EXPIRING_SOON' &&
                    rule.trigger.parameters?.daysBefore === daysUntilExpiration
                );

                triggeredRules.forEach(rule => {
                    const logKey = `${rule.id}_${policy.id}`;
                    const alreadySent = reminderLog.some(entry => entry.logKey === logKey);
                    const agent = userMap.get(customer.assignedAgentId);

                    if (!alreadySent && agent && evaluateConditions(rule.conditions, { customer, policy, agent })) {
                        rule.actions.forEach(action => {
                            const templateData = {
                                policyholderName: `${customer.firstName} ${customer.lastName}`,
                                policyNumber: policy.policyNumber,
                                expiryDate: expiryDate.toLocaleDateString(language),
                                agentName: agent ? `${agent.party.partyName.firstName} ${agent.party.partyName.lastName}` : 'Your Agent',
                                agentPhone: agent?.party.contactInfo.workPhone || 'N/A',
                                'customer.firstName': customer.firstName,
                                'customer.lastName': customer.lastName,
                                'policy.policyNumber': policy.policyNumber,
                                'policy.endDate': expiryDate.toLocaleDateString(language),
                            };

                            switch (action.actionType) {
                                case 'CREATE_TASK':
                                    if (action.template) {
                                        const message = renderTemplate(action.template, templateData);
                                        newTasks.push({
                                            id: `task_${policy.id}_${rule.id}`,
                                            type: 'RENEWAL_REMINDER',
                                            policyId: policy.id,
                                            customerId: customer.id,
                                            agentId: customer.assignedAgentId,
                                            message,
                                            createdAt: today.toISOString(),
                                        });
                                    }
                                    break;
                                
                                case 'SEND_EMAIL':
                                    const emailTemplate = emailTemplates.find(t => t.id === action.parameters?.templateId);
                                    if (emailTemplate) {
                                        const langContent = emailTemplate[language as keyof typeof emailTemplate];
                                        if (typeof langContent === 'object' && langContent !== null && 'subject' in langContent) {
                                            const subject = renderTemplate(langContent.subject, templateData);
                                            const body = renderTemplate(langContent.body, templateData);
                                            console.log(`[AUTOMATION] Mock Send Email:\n  - To: ${customer.email}\n  - Subject: ${subject}\n  - Body:\n${body}\n`);
                                        }
                                    }
                                    break;
                                    
                                case 'SEND_SMS':
                                    const smsTemplate = smsTemplates.find(t => t.id === action.parameters?.templateId);
                                    if (smsTemplate && customer.phone) {
                                        const message = renderTemplate(smsTemplate[language as keyof typeof smsTemplate] as string, templateData);
                                        console.log(`[AUTOMATION] Mock Send SMS:\n  - To: ${customer.phone}\n  - Message: ${message}\n`);
                                    }
                                    break;
                            }
                        });

                        reminderLog.push({
                            logKey,
                            policyId: policy.id,
                            ruleId: rule.id,
                            sentAt: today.toISOString(),
                        });
                    }
                });
            });
        });

        return { newTasks, updatedLog: reminderLog };
    } catch (error) {
        console.error("Error running renewal checks:", error);
        return { newTasks: [], updatedLog: reminderLog };
    }
};
