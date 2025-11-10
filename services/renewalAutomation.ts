import { Customer, User, AutomatedTask, ReminderLogEntry, RuleDefinition, Language, EmailTemplate, SmsTemplate } from '../types';
import { dayDifference, renderTemplate, evaluateConditions } from './automation.utils';


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
        const [rulesRes, emailTemplatesRes, smsTemplatesRes] = await Promise.all([
            fetch('/data/rules/renewal-reminders.rules.json'),
            fetch('/data/templates/renewal-email-templates.json'),
            fetch('/data/templates/renewal-sms-templates.json')
        ]);

        if (!rulesRes.ok || !emailTemplatesRes.ok || !smsTemplatesRes.ok) {
            throw new Error('Failed to fetch automation assets');
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
                    const context = { customer, policy, agent };

                    if (!alreadySent && agent && evaluateConditions(rule.conditions, context)) {
                        rule.actions.forEach(action => {
                            const templateData = {
                                policyholderName: `${customer.firstName} ${customer.lastName}`,
                                policyNumber: policy.policyNumber,
                                expiryDate: expiryDate.toLocaleDateString(language),
                                agentName: agent ? `${agent.party.partyName.firstName} ${agent.party.partyName.lastName}` : 'Your Agent',
                                agentPhone: agent?.party.contactInfo.workPhone || 'N/A',
                                ...context
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
                                        const langContent = emailTemplate[language];
                                        if (typeof langContent === 'object' && langContent !== null && 'subject' in langContent) {
                                            const subject = renderTemplate(langContent.subject, templateData);
                                            const body = renderTemplate(langContent.body, templateData);
                                            console.log(`[RENEWAL AUTOMATION] Mock Send Email:\n  - To: ${customer.email}\n  - Subject: ${subject}\n  - Body:\n${body}\n`);
                                        }
                                    }
                                    break;
                                    
                                case 'SEND_SMS':
                                    const smsTemplate = smsTemplates.find(t => t.id === action.parameters?.templateId);
                                    if (smsTemplate && customer.phone) {
                                        const message = renderTemplate(smsTemplate[language] as string, templateData);
                                        console.log(`[RENEWAL AUTOMATION] Mock Send SMS:\n  - To: ${customer.phone}\n  - Message: ${message}\n`);
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
        console.error("Error running renewal checks:", error);
        return { newTasks: [], updatedLog: reminderLog };
    }
};
