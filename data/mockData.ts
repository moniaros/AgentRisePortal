import { Customer, Lead, User, PolicyType, UserRole, Language, CampaignObjective, AuditLog, AnalyticsRecord, ExecutiveData, LeadStatus } from '../types';

export const MOCK_USERS: User[] = [
    { id: 'user_1', name: 'John Agent', email: 'john.agent@example.com', role: UserRole.AGENT, agencyId: 'agency_1' },
    { id: 'user_2', name: 'Jane Admin', email: 'moniaros@gmail.com', role: UserRole.ADMIN, agencyId: 'agency_1' },
    { id: 'user_3', name: 'Peter Broker', email: 'peter.broker@example.com', role: UserRole.AGENT, agencyId: 'agency_2' },
];

export const MOCK_LEADS: Lead[] = [
    { id: 'lead_1', firstName: 'Alice', lastName: 'Smith', email: 'alice.s@email.com', source: 'Facebook Campaign', status: 'new', potentialValue: 500, createdAt: '2023-10-01T10:00:00Z', policyType: PolicyType.AUTO, agencyId: 'agency_1' },
    { id: 'lead_2', firstName: 'Bob', lastName: 'Johnson', email: 'bob.j@email.com', source: 'Website Form', status: 'contacted', potentialValue: 1200, createdAt: '2023-10-02T11:30:00Z', policyType: PolicyType.HOME, agencyId: 'agency_1' },
    { id: 'lead_3', firstName: 'Charlie', lastName: 'Brown', email: 'charlie.b@email.com', source: 'Referral', status: 'qualified', potentialValue: 800, createdAt: '2023-09-28T14:00:00Z', policyType: PolicyType.LIFE, agencyId: 'agency_1' },
    { id: 'lead_4', firstName: 'Diana', lastName: 'Prince', email: 'diana.p@email.com', source: 'Instagram Ad', status: 'closed', potentialValue: 1500, createdAt: '2023-09-25T09:00:00Z', customerId: 'cust_2', policyType: PolicyType.HEALTH, agencyId: 'agency_1' },
    { id: 'lead_5', firstName: 'Eve', lastName: 'Adams', email: 'eve.a@email.com', source: 'LinkedIn', status: 'rejected', potentialValue: 600, createdAt: '2023-09-30T16:00:00Z', policyType: PolicyType.AUTO, agencyId: 'agency_1' },
];

export const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'cust_1',
        firstName: 'Michael',
        lastName: 'Scott',
        email: 'michael.scott@dundermifflin.com',
        phone: '555-0101',
        address: '1725 Slough Avenue, Scranton, PA',
        dateOfBirth: '1964-08-15',
        communicationPreferences: ['email'],
        policies: [
            { id: 'pol_1', type: PolicyType.AUTO, policyNumber: 'AUT12345', premium: 1200, startDate: '2023-01-15', endDate: '2024-01-15', isActive: true, insurer: 'Allied Insurance', coverages: [{ type: 'Liability', limit: '100k/300k' }, { type: 'Collision', limit: '$500 Ded.' }] },
            { id: 'pol_2', type: PolicyType.HOME, policyNumber: 'HOM67890', premium: 850, startDate: '2023-03-20', endDate: '2024-03-20', isActive: true, insurer: 'Commonwealth Ins.', coverages: [{ type: 'Dwelling', limit: '300k' }, { type: 'Personal Property', limit: '150k' }] },
        ],
        timeline: [
            { id: 'evt_1', date: '2023-09-15T14:30:00Z', type: 'call', content: 'Discussed renewal options for auto policy.', author: 'John Agent' },
            { id: 'evt_2', date: '2023-03-20T09:00:00Z', type: 'system', content: 'Home policy created.', author: 'System' },
        ],
        agencyId: 'agency_1'
    },
    {
        id: 'cust_2',
        firstName: 'Diana',
        lastName: 'Prince',
        email: 'diana.p@email.com',
        phone: '555-0102',
        address: '123 Paradise Island',
        dateOfBirth: '1941-10-25',
        communicationPreferences: ['email', 'sms'],
        attentionFlag: 'High value client, check in quarterly.',
        policies: [
            { id: 'pol_3', type: PolicyType.HEALTH, policyNumber: 'HLT54321', premium: 4500, startDate: '2023-09-25', endDate: '2024-09-25', isActive: true, insurer: 'Stark Industries Health', coverages: [{ type: 'PPO Plan', limit: 'Gold Tier' }] },
        ],
        timeline: [
            { id: 'evt_3', date: '2023-09-25T10:00:00Z', type: 'email', content: 'Welcome email sent with policy documents.', author: 'John Agent' },
        ],
        agencyId: 'agency_1'
    }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    {id: 'log_1', timestamp: new Date().toISOString(), actorName: 'Jane Admin', action: 'user_invited', targetName: 'new.user@example.com', details: 'Invited with role: agent', agencyId: 'agency_1' },
    {id: 'log_2', timestamp: new Date(Date.now() - 86400000).toISOString(), actorName: 'Jane Admin', action: 'role_changed', targetName: 'John Agent', details: 'Role changed from agent to admin', agencyId: 'agency_1' },
];

export const MOCK_ANALYTICS_DATA: AnalyticsRecord[] = [
    { date: '2024-07-15', campaignId: 'camp_1', impressions: 1500, clicks: 75, conversions: 5, spend: 50 },
    { date: '2024-07-16', campaignId: 'camp_1', impressions: 1600, clicks: 82, conversions: 7, spend: 55 },
    { date: '2024-08-05', campaignId: 'camp_2', impressions: 2500, clicks: 100, conversions: 2, spend: 80 },
    { date: '2024-08-06', campaignId: 'camp_2', impressions: 2600, clicks: 110, conversions: 3, spend: 85 },
];

export const MOCK_EXECUTIVE_DATA: ExecutiveData = {
    agencyGrowth: [
        { month: 'Jan', premium: 120000, policies: 80 },
        { month: 'Feb', premium: 135000, policies: 85 },
        { month: 'Mar', premium: 150000, policies: 92 },
    ],
    productMix: [
        { name: PolicyType.AUTO, value: 45 },
        { name: PolicyType.HOME, value: 30 },
        { name: PolicyType.LIFE, value: 15 },
        { name: PolicyType.HEALTH, value: 10 },
    ],
    claimsTrend: [
        { month: 'Jan', submitted: 20, approved: 18, paid: 50000 },
        { month: 'Feb', submitted: 25, approved: 22, paid: 62000 },
        { month: 'Mar', submitted: 18, approved: 15, paid: 45000 },
    ],
    leadFunnel: [
        { status: 'new' as LeadStatus, count: 100 },
        { status: 'contacted' as LeadStatus, count: 80 },
        { status: 'qualified' as LeadStatus, count: 50 },
        { status: 'closed' as LeadStatus, count: 20 },
    ],
    campaignRoi: [
        { id: 'camp_1', name: 'Summer Auto Promo', spend: 5000, revenue: 15000 },
        { id: 'camp_2', name: 'Home Security Campaign', spend: 7500, revenue: 18000 },
    ],
    riskExposure: [
        { area: 'Coastal Properties', exposure: 1500000, mitigation: 800000 },
        { area: 'High-Risk Drivers', exposure: 800000, mitigation: 600000 },
        { area: 'Commercial Liability', exposure: 2500000, mitigation: 1500000 },
    ]
};
