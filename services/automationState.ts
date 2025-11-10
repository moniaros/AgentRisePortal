import { RuleDefinition } from "../types";

export const RENEWAL_RULES: RuleDefinition[] = [
    { id: 'RR-001', trigger: { eventType: 'POLICY_EXPIRING_SOON', parameters: { daysBefore: 30 } }, conditions: [], actions: [{ actionType: 'CREATE_TASK', template: 'Follow up with {customer.firstName} about policy {policy.policyNumber}.' }], isEnabled: true }
];

export const PAYMENT_RULES: RuleDefinition[] = [
    { id: 'PR-001', trigger: { eventType: 'PAYMENT_DUE_SOON', parameters: { daysBefore: 7 } }, conditions: [], actions: [{ actionType: 'SEND_EMAIL', template: 'payment_reminder_7_days' }], isEnabled: true },
    { id: 'PR-002', trigger: { eventType: 'PAYMENT_OVERDUE', parameters: { daysAfter: 3 } }, conditions: [], actions: [{ actionType: 'SEND_SMS', template: 'Your payment for policy {policy.policyNumber} is overdue.' }, {actionType: 'CREATE_TASK', template: 'Call {customer.firstName} about overdue payment for {policy.policyNumber}.'}], isEnabled: true },
];
