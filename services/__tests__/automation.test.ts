/**
 * @jest-environment jsdom
 */
// NOTE: This file is a placeholder for a real test suite and requires a test runner (like Jest) to be configured.
// To run this, you would need to install Jest, ts-jest, and @testing-library/react.
// Example commands:
// npm install --save-dev jest jest-environment-jsdom ts-jest @types/jest @testing-library/react
// Then configure jest.config.js and add a "test" script to package.json.

import { describe, it, expect, jest } from '@jest/globals';
import { dayDifference, renderTemplate, evaluateConditions } from '../automation.utils';
import { runRenewalChecks } from '../renewalAutomation';
import { Customer, User, UserSystemRole, PolicyType, RuleDefinition, Language, ReminderLogEntry } from '../../types';

// ===== UNIT TESTS for automation.utils.ts =====

describe('Automation Utilities', () => {

    describe('dayDifference', () => {
        it('should correctly calculate the difference between two dates', () => {
            const today = new Date('2024-01-15');
            const futureDate = new Date('2024-01-25');
            const pastDate = new Date('2024-01-10');
            expect(dayDifference(today, futureDate)).toBe(10);
            expect(dayDifference(today, pastDate)).toBe(-5);
            expect(dayDifference(today, today)).toBe(0);
        });
    });

    describe('renderTemplate', () => {
        const data = {
            customer: { firstName: 'John', lastName: 'Doe' },
            policy: { policyNumber: 'ABC-123' },
            expiryDate: '2025-01-01',
        };

        it('should replace simple placeholders', () => {
            const template = 'Policy expires on {expiryDate}.';
            expect(renderTemplate(template, data)).toBe('Policy expires on 2025-01-01.');
        });

        it('should replace nested placeholders', () => {
            const template = 'Hello {customer.firstName}, your policy is {policy.policyNumber}.';
            expect(renderTemplate(template, data)).toBe('Hello John, your policy is ABC-123.');
        });

        it('should handle missing placeholders gracefully', () => {
            const template = 'Agent assigned: {agent.name}.';
            expect(renderTemplate(template, data)).toBe('Agent assigned: {agent.name}.');
        });
    });

    describe('evaluateConditions', () => {
        const context = {
            policy: { type: 'auto', premiumAmount: 1500 },
            customer: { status: 'active' },
        };

        it('should return true for an EQUALS condition that matches', () => {
            const conditions: RuleDefinition['conditions'] = [{ field: 'policy.type', operator: 'EQUALS', value: 'auto' }];
            expect(evaluateConditions(conditions, context)).toBe(true);
        });

        it('should return false for an EQUALS condition that does not match', () => {
            const conditions: RuleDefinition['conditions'] = [{ field: 'policy.type', operator: 'EQUALS', value: 'home' }];
            expect(evaluateConditions(conditions, context)).toBe(false);
        });
        
        it('should return true for a GREATER_THAN condition that matches', () => {
             const conditions: RuleDefinition['conditions'] = [{ field: 'policy.premiumAmount', operator: 'GREATER_THAN', value: 1000 }];
             expect(evaluateConditions(conditions, context)).toBe(true);
        });
        
         it('should return false for a GREATER_THAN condition that does not match', () => {
             const conditions: RuleDefinition['conditions'] = [{ field: 'policy.premiumAmount', operator: 'GREATER_THAN', value: 2000 }];
             expect(evaluateConditions(conditions, context)).toBe(false);
        });
    });
});


// ===== INTEGRATION TESTS for Automation Services =====

describe('Automation Services Integration', () => {

    // Mock Data
    const mockUser: User = {
        id: 'user_1',
        agencyId: 'agency_1',
        party: { partyName: { firstName: 'Agent', lastName: 'Smith' }, contactInfo: { email: 'agent@test.com' } },
        partyRole: { roleType: UserSystemRole.AGENT, roleTitle: 'Agent', permissionsScope: 'agency' },
    };

    const mockCustomer: Customer = {
        id: 'cust_1',
        firstName: 'Bob',
        lastName: 'Builder',
        email: 'bob@builder.com',
        phone: '555-1234',
        agencyId: 'agency_1',
        assignedAgentId: 'user_1',
        policies: [],
        timeline: [],
    };
    
    // Mock fetch
    // FIX: Replaced `global.fetch` with `globalThis.fetch` to resolve 'Cannot find name `global`' error.
    globalThis.fetch = jest.fn((url: string | URL | globalThis.Request) =>
        Promise.resolve({
            ok: true,
            json: () => {
                if (url.toString().includes('renewal-reminders')) {
                    return Promise.resolve([
                        { id: 'RR-001', trigger: { eventType: 'POLICY_EXPIRING_SOON', parameters: { daysBefore: 30 } }, conditions: [], actions: [{ actionType: 'CREATE_TASK', template: 'Renewal task for {policy.policyNumber}' }], isEnabled: true }
                    ]);
                }
                return Promise.resolve({ templates: [] });
            },
        } as Response)
    );

    it('runRenewalChecks should generate a task for a policy expiring in 30 days', async () => {
        const today = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(today.getDate() + 30);

        const customerWithExpiringPolicy = {
            ...mockCustomer,
            policies: [
                { id: 'p1', policyNumber: 'AUTO-30DAY', type: PolicyType.AUTO, startDate: '2023-01-01', endDate: expiryDate.toISOString().split('T')[0], premiumAmount: 1000, isActive: true },
            ],
        };

        const { newTasks } = await runRenewalChecks([customerWithExpiringPolicy], [mockUser], [], { language: Language.EN });

        expect(newTasks).toHaveLength(1);
        expect(newTasks[0].message).toBe('Renewal task for AUTO-30DAY');
    });

    it('runRenewalChecks should NOT generate a task for a policy expiring on a different day', async () => {
        const today = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(today.getDate() + 29); // 29 days away

        const customerWithPolicy = {
            ...mockCustomer,
            policies: [
                { id: 'p1', policyNumber: 'AUTO-29DAY', type: PolicyType.AUTO, startDate: '2023-01-01', endDate: expiryDate.toISOString().split('T')[0], premiumAmount: 1000, isActive: true },
            ],
        };

        const { newTasks } = await runRenewalChecks([customerWithPolicy], [mockUser], [], { language: Language.EN });

        expect(newTasks).toHaveLength(0);
    });
    
    it('runRenewalChecks should NOT generate a task if it was already logged', async () => {
        const today = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(today.getDate() + 30);

        const customerWithExpiringPolicy = {
            ...mockCustomer,
            policies: [
                { id: 'p1', policyNumber: 'AUTO-30DAY', type: PolicyType.AUTO, startDate: '2023-01-01', endDate: expiryDate.toISOString().split('T')[0], premiumAmount: 1000, isActive: true },
            ],
        };

        const existingLog: ReminderLogEntry[] = [
            { logKey: 'RR-001_p1', policyId: 'p1', ruleId: 'RR-001', sentAt: new Date().toISOString() }
        ];

        const { newTasks } = await runRenewalChecks([customerWithExpiringPolicy], [mockUser], existingLog, { language: Language.EN });

        expect(newTasks).toHaveLength(0);
    });
});
