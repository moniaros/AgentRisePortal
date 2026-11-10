import {
    AutomationEvent,
    AutomationRule,
    Lead,
    MessageTemplate,
    Opportunity__EXT,
    Prospect,
    Task,
    TemplateChannel,
} from '../types';
import { simulateRule, renderTemplateContent } from '../lib/rule-engine';
import {
    automationRuleService,
    automationEventService,
    templateService,
    taskService,
    prospectService,
    opportunityService,
} from './api';
import { broadcastStoreUpdate } from '../hooks/useOfflineSync';

function mapActionToChannel(actionType: string): TemplateChannel | undefined {
    switch (actionType) {
        case 'send_email':
            return 'email';
        case 'send_sms':
            return 'sms';
        case 'send_viber':
            return 'viber';
        case 'send_whatsapp':
            return 'whatsapp';
        default:
            return undefined;
    }
}

export async function executeAutomationTrigger(
    triggerType: 'on_lead_creation' | 'on_status_change',
    lead: Lead
): Promise<AutomationEvent[]> {
    const [allRules, allTemplates, existingEvents] = await Promise.all([
        automationRuleService.getAll(),
        templateService.getAll(),
        automationEventService.getAll(),
    ]);

    const matchingRules = allRules.filter(
        (rule) =>
            rule.isEnabled &&
            rule.agencyId === lead.agencyId &&
            rule.triggerType === triggerType
    );

    if (matchingRules.length === 0) return [];

    const createdEvents: AutomationEvent[] = [];
    const updatedRules: AutomationRule[] = [...allRules];

    for (const rule of matchingRules) {
        const sim = simulateRule(rule, lead);
        if (!sim.conditionsMet) continue;

        for (const action of rule.actions) {
            const channel = mapActionToChannel(action.type);
            let details = '';

            if (channel) {
                const tmpl: MessageTemplate | undefined = allTemplates.find(
                    (t) => t.id === action.templateId
                );
                const preview = tmpl
                    ? renderTemplateContent(tmpl.content, lead)
                    : `Automated ${channel.toUpperCase()} outreach dispatched to ${lead.firstName} ${lead.lastName}.`;
                details = `[${channel.toUpperCase()}] Sent to ${lead.firstName} ${lead.lastName}: "${preview.slice(0, 90)}"`;
            } else if (action.type === 'create_task') {
                const existingTasks = await taskService.getAll();
                const dueTomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
                const newTask: Task = {
                    id: `task_auto_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
                    agencyId: lead.agencyId,
                    agentId: 'user_1',
                    title:
                        action.taskTitle ||
                        `Follow up on ${lead.policyType.toUpperCase()} lead: ${lead.firstName} ${lead.lastName}`,
                    dueDate: dueTomorrow,
                    isCompleted: false,
                    completedAt: null,
                    createdAt: new Date().toISOString(),
                    relatedTo: {
                        type: 'lead',
                        id: lead.id,
                        name: `${lead.firstName} ${lead.lastName}`,
                    },
                };
                broadcastStoreUpdate('agentos_db_tasks', [newTask, ...existingTasks]);
                details = `Created SLA follow-up task "${newTask.title}" due ${dueTomorrow}.`;
            } else if (action.type === 'create_opportunity') {
                const [existingProspects, existingOpps] = await Promise.all([
                    prospectService.getAll(),
                    opportunityService.getAll(),
                ]);
                const prospect: Prospect = {
                    id: `prospect_auto_${Date.now()}`,
                    agencyId: lead.agencyId,
                    firstName: lead.firstName,
                    lastName: lead.lastName,
                    email: lead.email,
                    phone: lead.phone || '',
                };
                const opp: Opportunity__EXT = {
                    id: `opp_auto_${Date.now()}`,
                    title: `${lead.policyType.toUpperCase()} Policy — ${lead.firstName} ${lead.lastName}`,
                    value: lead.potentialValue || 350,
                    prospectId: prospect.id,
                    stage: 'new',
                    nextFollowUpDate: new Date(Date.now() + 86_400_000).toISOString(),
                    agentId: 'user_1',
                    agencyId: lead.agencyId,
                    inquiryId: lead.campaignId || lead.id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                broadcastStoreUpdate('agentos_db_prospects', [prospect, ...existingProspects]);
                broadcastStoreUpdate('agentos_db_opportunities', [opp, ...existingOpps]);
                details = `Auto-created Pipeline Opportunity "${opp.title}" (€${opp.value}).`;
            }

            createdEvents.push({
                id: `aevt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                agencyId: lead.agencyId,
                timestamp: new Date().toISOString(),
                ruleId: rule.id,
                ruleName: rule.name,
                status: 'success',
                details,
                channel,
            });
        }

        const rIdx = updatedRules.findIndex((r) => r.id === rule.id);
        if (rIdx > -1) {
            updatedRules[rIdx] = {
                ...updatedRules[rIdx],
                lastExecuted: new Date().toISOString(),
                successRate: Math.min(100, Math.max(updatedRules[rIdx].successRate || 95, 98)),
            };
        }
    }

    if (createdEvents.length > 0) {
        broadcastStoreUpdate('agentos_db_automation_events', [...createdEvents, ...existingEvents]);
        broadcastStoreUpdate('agentos_db_automation_rules', updatedRules);
    }

    return createdEvents;
}

let listenerRegistered = false;

export function registerGlobalAutomationListeners(): void {
    if (typeof window === 'undefined' || listenerRegistered) return;
    listenerRegistered = true;

    window.addEventListener('agentos:lead-created', (e: Event) => {
        const custom = e as CustomEvent<{ lead: Lead }>;
        if (custom.detail?.lead) {
            executeAutomationTrigger('on_lead_creation', custom.detail.lead).catch((err) =>
                console.warn('Automation trigger error:', err)
            );
        }
    });

    window.addEventListener('agentos:lead-status-changed', (e: Event) => {
        const custom = e as CustomEvent<{ lead: Lead }>;
        if (custom.detail?.lead) {
            executeAutomationTrigger('on_status_change', custom.detail.lead).catch((err) =>
                console.warn('Automation status trigger error:', err)
            );
        }
    });
}
