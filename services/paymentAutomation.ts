
import { Customer, User, AutomatedTask, ReminderLogEntry, RuleDefinition, Language, EmailTemplate, SmsTemplate, TriggerEventType } from '../types';

const dayDifference = (date1: Date, date2: Date): number => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc2 - utc1) / msPerDay);
};

const renderTemplate = (template: string, data: Record<string, string>): string => {
    let rendered = template;
    for (const key in data) {
        // FIX: Regex was incorrectly looking for {{...}} instead of {...}.
        const regex = new RegExp(`\\{${key.replace('.', '\\.')}\\}`, 'g');
        rendered = rendered.replace(regex, data[key]);
    }
    return rendered;
};

const evaluateConditions = (conditions: RuleDefinition['conditions'], context: any): boolean => {
    if (!conditions || conditions.length === 0) return true;
    return conditions.every(condition => {
        const value = condition.field.split('.').reduce((o, i) => (o ? o[i] : undefined), context);
        switch (condition.operator) {
            case 'EQUALS': return value === condition.value;
            case 'NOT_EQUALS': return value !== condition.value;
            default: return false;
        }
    });
};

const getTriggerTypeForDays = (days: number): TriggerEventType | null => {
    if (days === 30) return 'PAYMENT_DUE_IN_30_DAYS';
    if (days === 7) return 'PAYMENT_DUE_IN_7_DAYS';
    if (days === 0) return 'PAYMENT_DUE_TODAY';
    if (days === -3) return 'PAYMENT_OVERDUE_3_DAYS';
    return null;
}

export const runPaymentChecks = async (
    customers: Customer[],
    users: User[],
    reminderLog: ReminderLogEntry[],
    translations: any
): Promise<{ newTasks: AutomatedTask[], updatedLog: ReminderLogEntry[] }> => {

    try {
        const [rulesRes, emailTemplatesRes, smsTemplatesRes] = await Promise.all([
            fetch('/data/rules/payment-reminders.rules.json'),
            fetch('/data/templates/payment-email-templates.json'),
            fetch('/data/templates/payment-sms-templates.json')
        ]);

        if (!rulesRes.ok || !emailTemplatesRes.ok || !smsTemplatesRes.ok) {
            throw new Error('Failed to fetch payment automation assets');
        }

        const rules: RuleDefinition[] = await rulesRes.json();
        const emailTemplates: EmailTemplate[] = (await emailTemplatesRes.json()).templates;
        const smsTemplates: SmsTemplate[] = (await smsTemplatesRes.json()).templates;

        const newTasks: AutomatedTask[] = [];
        const newLogEntries: ReminderLogEntry[] = [];
        const today = new Date();
        const userMap = new Map(users.map(u => [u.id, u]));
        const language: Language = translations.language || Language.EL;

        customers.forEach(customer => {
            customer.policies.forEach(policy => {
                if (!policy.paymentDueDate || policy.paymentStatus === 'paid') return;

                const dueDate = new Date(policy.paymentDueDate);
                const daysUntilDue = dayDifference(today, dueDate);
                const triggerType = getTriggerTypeForDays(daysUntilDue);
                
                if (!triggerType) return;

                const triggeredRules = rules.filter(rule => rule.isEnabled && rule.trigger.eventType === triggerType);

                triggeredRules.forEach(rule => {
                    const logKey = `${rule.id}_${policy.id}`;
                    const alreadySent = reminderLog.some(entry => entry.logKey === logKey);
                    const agent = userMap.get(customer.assignedAgentId);

                    if (!alreadySent && agent && evaluateConditions(rule.conditions, { customer, policy, agent })) {
                        rule.actions.forEach(action => {
                             const templateData = {
                                'customerName': `${customer.firstName} ${customer.lastName}`,
                                'policyNumber': policy.policyNumber,
                                'paymentDueDate': dueDate.toLocaleDateString(language),
                                'premiumAmount': policy.premiumAmount.toFixed(2),
                                'agentName': `${agent.party.partyName.firstName} ${agent.party.partyName.lastName}`,
                                'agentPhone': agent.party.contactInfo.workPhone || '',
                            };

                            switch (action.actionType) {
                                case 'CREATE_TASK':
                                    // FIX: Logic was incorrect. Now uses the template string from the rule directly, aligning with renewalAutomation service.
                                    if (action.template) {
                                        const message = renderTemplate(action.template, templateData);
                                        newTasks.push({
                                            id: `task_payment_${policy.id}_${rule.id}`,
                                            type: 'PAYMENT_DUE',
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
                                        const langContent = emailTemplate[language];
                                        if (langContent && 'subject' in langContent) {
                                            const subject = renderTemplate(langContent.subject, templateData);
                                            const body = renderTemplate(langContent.body, templateData);
                                            console.log(`[PAYMENT AUTOMATION] Mock Send Email:\n  - To: ${customer.email}\n  - Subject: ${subject}\n  - Body:\n${body}\n`);
                                        }
                                    }
                                    break;
                                    
                                case 'SEND_SMS':
                                    const smsTemplate = smsTemplates.find(t => t.id === action.parameters?.templateId);
                                    if (smsTemplate && customer.phone) {
                                        const message = renderTemplate(smsTemplate[language] as string, templateData);
                                        console.log(`[PAYMENT AUTOMATION] Mock Send SMS:\n  - To: ${customer.phone}\n  - Message: ${message}\n`);
                                    }
                                    break;
                            }
                        });

                        newLogEntries.push({
                            logKey,
                            policyId: policy.id,
                            ruleId: rule.id,
                            sentAt: today.toISOString(),
                        });
                    }
                });
            });
        });

        return { newTasks, updatedLog: [...reminderLog, ...newLogEntries] };

    } catch (error) {
        console.error("Error running payment checks:", error);
        return { newTasks: [], updatedLog: reminderLog };
    }
};
