import test from 'node:test';
import assert from 'node:assert/strict';

import {
    hashPassword,
    verifyPassword,
    signSessionToken,
    verifySessionToken,
    computeAuditHash,
} from '../server/security';
import {
    createDefaultAgencyBilling,
    consumeAiCredits,
    changeAgencyPlan,
} from '../server/creditLedger';
import {
    generateComparativeQuotes,
    getQuickQuoteRange,
} from '../lib/comparativeRater';
import { simulateRule, renderTemplateContent } from '../lib/rule-engine';
import {
    computeRenewalRadar,
    evaluateCustomerHouseholdProfile,
} from '../lib/renewalEngine';
import {
    computeAgencyCommissions,
    buildBordereauxCsv,
} from '../lib/commissionEngine';
import { Customer, LeadStatus, PolicyType, AutomationRule } from '../types';

test('Security Kernel: PBKDF2 password hashing, HMAC session tokens, and audit hash chain', () => {
    const { hash, salt } = hashPassword('password123');
    assert.equal(verifyPassword('password123', hash, salt), true);
    assert.equal(verifyPassword('wrong-password', hash, salt), false);

    const token = signSessionToken(
        {
            userId: 'user_2',
            agencyId: 'agency_1',
            email: 'admin@agency1.com',
            role: 'admin',
        },
        3600,
        'test-secret'
    );
    const verified = verifySessionToken(token, 'test-secret');
    assert.ok(verified);
    assert.equal(verified?.email, 'admin@agency1.com');
    assert.equal(verified?.agencyId, 'agency_1');

    // Reject tampered signature or wrong secret
    assert.equal(verifySessionToken(`${token}tampered`, 'test-secret'), null);
    assert.equal(verifySessionToken(token, 'wrong-secret'), null);

    // Reject expired token
    const expired = signSessionToken(
        {
            userId: 'user_2',
            agencyId: 'agency_1',
            email: 'admin@agency1.com',
            role: 'admin',
        },
        -10,
        'test-secret'
    );
    assert.equal(verifySessionToken(expired, 'test-secret'), null);

    // Deterministic tamper-evident audit hash chain
    const h1 = computeAuditHash('GENESIS', { action: 'login', actor: 'admin' });
    const h2 = computeAuditHash(h1, { action: 'bind_policy', policy: 'CAR-1' });
    assert.notEqual(h1, h2);
    assert.equal(h1.length, 64);
});

test('Flex-Budget Credit Ledger: included credits, 80% warning, hard-cap 402 block, and myDATA plan invoices', () => {
    let state = createDefaultAgencyBilling('agency_test');
    // Default starts at 4500 / 5000 credits, €50 overage cap, €0 used
    const step1 = consumeAiCredits(state, 'generate', 500); // Consumes remaining 500 included credits -> €0 overage
    assert.equal(step1.allowed, true);
    assert.equal(step1.overageEuroCharged, 0);
    assert.equal(step1.state.aiCredits.used, 5000);

    // Next 4100 credits = €41.00 overage (>80% of €50 cap -> approaching_80 warning)
    const step2 = consumeAiCredits(step1.state, 'generate', 4100);
    assert.equal(step2.allowed, true);
    assert.equal(step2.overageEuroCharged, 41);
    assert.equal(step2.warningLevel, 'approaching_80');

    // Trying to spend another 1000 credits (€10 -> €51 > €50 cap) must be blocked!
    const blocked = consumeAiCredits(step2.state, 'generate', 1000);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.warningLevel, 'limit_reached');

    // Upgrading plan to Enterprise increases credit limit to 25,000 and issues a 24% VAT myDATA invoice
    const upgraded = changeAgencyPlan(step2.state, 'enterprise');
    assert.equal(upgraded.planId, 'enterprise');
    assert.equal(upgraded.aiCredits.limit, 25000);
    assert.equal(upgraded.invoices[0].amount, 199);
    assert.ok(upgraded.invoices[0].mydataMark.startsWith('40000'));
});

test('Comparative Rater: 6 carriers, ENFIA -20% catastrophe verification, and quick quote range', () => {
    const homeQuotes = generateComparativeQuotes({
        policyType: PolicyType.HOME,
        assetValue: 180000,
        squareMeters: 120,
        includeCatastrophePerils: true,
    });
    assert.equal(homeQuotes.length, 6);
    assert.equal(homeQuotes[0].enfiaTaxDiscountEligible, true);
    assert.ok(homeQuotes[0].annualGrossPremium > homeQuotes[0].netPremium);
    assert.ok(homeQuotes[0].commissionEuro > 0);

    const noCatQuotes = generateComparativeQuotes({
        policyType: PolicyType.HOME,
        assetValue: 180000,
        squareMeters: 120,
        includeCatastrophePerils: false,
    });
    assert.equal(noCatQuotes[0].enfiaTaxDiscountEligible, false);

    const range = getQuickQuoteRange({
        policyType: PolicyType.AUTO,
        assetValue: 20000,
        driverOrInsuredAge: 35,
    });
    assert.ok(range.minMonthly > 0);
    assert.ok(range.maxMonthly >= range.minMonthly);
});

test('Automation Rule Engine: AND/OR combinators, numeric & contains operators, and merge tags', () => {
    const ruleAnd: AutomationRule = {
        id: 'r1',
        agencyId: 'agency_1',
        name: 'High Value Home',
        description: 'Test',
        category: 'lead_conversion',
        triggerType: 'on_lead_creation',
        logicalOperator: 'AND',
        conditions: [
            { id: 'c1', field: 'policy_interest', operator: 'is', value: 'home' },
            { id: 'c2', field: 'potential_value', operator: 'greater_than', value: 250 },
            { id: 'c3', field: 'lead_source', operator: 'contains', value: 'enfia' },
        ],
        actions: [],
        isEnabled: true,
        lastExecuted: null,
        successRate: 100,
    };

    const lead = {
        id: 'l1',
        agencyId: 'agency_1',
        firstName: 'Nikos',
        lastName: 'Karras',
        email: 'nikos@example.com',
        phone: '6970001111',
        source: 'ENFIA Home Campaign',
        status: LeadStatus.NEW,
        createdAt: new Date().toISOString(),
        policyType: PolicyType.HOME,
        potentialValue: 340,
        score: 90,
    };

    const res = simulateRule(ruleAnd, lead);
    assert.equal(res.conditionsMet, true);

    const rendered = renderTemplateContent(
        'Hello {{Lead.FirstName}}, your {{Lead.PolicyType}} quote is {{Lead.PotentialValue}}.',
        lead
    );
    assert.equal(rendered, 'Hello Nikos, your HOME quote is €340.');
});

test('Renewal Radar, Household Risk ENFIA Audit & Carrier Commission Bordereaux', () => {
    const refDate = new Date('2026-11-10T00:00:00Z');
    const sampleCustomers: Customer[] = [
        {
            id: 'cust_1',
            agencyId: 'agency_1',
            firstName: 'Alexandros',
            lastName: 'Papageorgiou',
            email: 'alex@example.com',
            policies: [
                {
                    id: 'p1',
                    type: PolicyType.AUTO,
                    policyNumber: 'CAR-123',
                    premium: 350,
                    startDate: '2025-11-25',
                    endDate: '2026-11-25', // +15 days -> due30
                    isActive: true,
                    insurer: 'Generali',
                    coverages: [{ type: 'Bodily Injury', limit: '€1,300,000' }],
                },
                {
                    id: 'p2',
                    type: PolicyType.HOME,
                    policyNumber: 'HOM-456',
                    premium: 180,
                    startDate: '2025-12-20',
                    endDate: '2026-12-20', // +40 days -> due60
                    isActive: true,
                    insurer: 'Interamerican',
                    coverages: [{ type: 'Fire (Building)', limit: '€150,000' }],
                },
            ],
            timeline: [],
        },
    ];

    const radar = computeRenewalRadar(sampleCustomers, refDate);
    assert.equal(radar.due30.length, 1);
    assert.equal(radar.due60.length, 1);
    assert.equal(radar.totalAtRiskGwp, 530);

    const household = evaluateCustomerHouseholdProfile(sampleCustomers[0]);
    assert.equal(household.hasHomePolicy, true);
    assert.equal(household.enfiaEligible, false);
    assert.ok(household.missingEnfiaPerils.includes('Earthquake'));
    assert.deepEqual(household.missingLines, [PolicyType.HEALTH, PolicyType.LIFE]);

    const commissions = computeAgencyCommissions(sampleCustomers);
    assert.equal(commissions.totalPortfolioGwp, 530);
    assert.ok(commissions.totalGrossCommission > 0);
    assert.equal(
        Number((commissions.totalSubAgentPayout + commissions.totalAgencyNetRetained).toFixed(2)),
        commissions.totalGrossCommission
    );
    const csv = buildBordereauxCsv(commissions);
    assert.ok(csv.includes('CAR-123'));
    assert.ok(csv.includes('Generali'));
});

test('Zero-Broken-Image SVG Generators: XML-safe avatars and campaign banners', async () => {
    const { getAvatarDataUri, getCampaignBannerDataUri } = await import('../lib/avatars');
    for (const theme of ['auto', 'home', 'health', 'business'] as const) {
        const uri = getCampaignBannerDataUri(theme);
        assert.ok(uri.startsWith('data:image/svg+xml;utf8,'));
        const decoded = decodeURIComponent(uri.replace('data:image/svg+xml;utf8,', ''));
        // Every '&' in XML must be followed by an entity such as amp;, lt;, gt;, quot;, apos;
        assert.equal(/&(?!(amp|lt|gt|quot|apos);)/.test(decoded), false);
    }
    const avatar = getAvatarDataUri('Anna & Nikos');
    const decodedAvatar = decodeURIComponent(avatar.replace('data:image/svg+xml;utf8,', ''));
    assert.equal(/&(?!(amp|lt|gt|quot|apos);)/.test(decodedAvatar), false);
});
