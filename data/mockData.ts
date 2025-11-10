import { Customer, Lead, PolicyType, DetailedPolicy, AnalyticsData, User, AuditLog, Language, CampaignObjective, UserRole } from '../types';

export const MOCK_USERS: User[] = [
    { id: 'user_1', name: 'Admin User', email: 'admin@alpha.com', role: 'admin', agencyId: 'agency_1' },
    { id: 'user_2', name: 'Agent Smith', email: 'agent.smith@alpha.com', role: 'agent', agencyId: 'agency_1' },
    { id: 'user_3', name: 'Jane Doe', email: 'jane.doe@beta.com', role: 'admin', agencyId: 'agency_2' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log_1', timestamp: new Date(Date.now() - 86400000).toISOString(), actorName: 'Admin User', action: 'user_invited', targetName: 'agent.smith@alpha.com', details: 'Invited with role: agent', agencyId: 'agency_1' },
    { id: 'log_2', timestamp: new Date(Date.now() - 172800000).toISOString(), actorName: 'Jane Doe', action: 'role_changed', targetName: 'Test User', details: 'Role changed from agent to admin', agencyId: 'agency_2' },
];

export const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'cust_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-1234',
        address: '123 Main St, Anytown, USA',
        dateOfBirth: '1985-05-15',
        agencyId: 'agency_1',
        attentionFlag: 'High value client, review policies annually.',
        policies: [
            { id: 'pol_1', type: PolicyType.AUTO, policyNumber: 'AUT12345', premium: 1200, startDate: '2024-01-01', endDate: '2025-01-01', isActive: true, insurer: 'Geico' },
            { id: 'pol_2', type: PolicyType.HOME, policyNumber: 'HOM67890', premium: 800, startDate: '2023-06-15', endDate: '2024-06-15', isActive: true, insurer: 'Allstate' },
        ],
        timeline: [
            { id: 'evt_1', date: '2024-03-10T10:00:00Z', type: 'call', content: 'Discussed renewal for home policy.', author: 'Agent Smith' },
            { id: 'evt_2', date: '2024-01-05T14:30:00Z', type: 'email', content: 'Sent updated auto policy documents.', author: 'Agent Smith' },
        ]
    },
    {
        id: 'cust_2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-5678',
        address: '456 Oak Ave, Anytown, USA',
        dateOfBirth: '1990-11-20',
        agencyId: 'agency_1',
        policies: [
            { id: 'pol_3', type: PolicyType.HEALTH, policyNumber: 'HEA11223', premium: 3000, startDate: '2024-02-01', endDate: '2025-02-01', isActive: true, insurer: 'Blue Cross' },
        ],
        timeline: [
            { id: 'evt_3', date: '2024-02-01T09:00:00Z', type: 'note', content: 'Onboarded for new health policy.', author: 'Agent Smith' },
        ]
    }
];

export const MOCK_LEADS: Lead[] = [
    { id: 'lead_1', firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@example.com', source: 'Facebook', status: 'new', potentialValue: 1500, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), policyType: PolicyType.AUTO, agencyId: 'agency_1', campaignId: 'camp_1' },
    { id: 'lead_2', firstName: 'Emily', lastName: 'Williams', email: 'emily.w@example.com', source: 'Website', status: 'contacted', potentialValue: 900, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), policyType: PolicyType.HOME, agencyId: 'agency_1' },
    { id: 'lead_3', firstName: 'David', lastName: 'Brown', email: 'david.b@example.com', source: 'Referral', status: 'qualified', potentialValue: 2500, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), policyType: PolicyType.LIFE, agencyId: 'agency_1', customerId: 'cust_1' },
    { id: 'lead_4', firstName: 'Sarah', lastName: 'Miller', email: 'sarah.m@example.com', source: 'Instagram', status: 'closed', potentialValue: 3000, createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), policyType: PolicyType.HEALTH, agencyId: 'agency_1', customerId: 'cust_2' },
];

export const MOCK_DASHBOARD_DATA = {
    newLeadsCount: 18,
    monthlyRevenue: 24500,
    policyDistribution: [
        { name: 'auto', value: 152 },
        { name: 'home', value: 89 },
        { name: 'life', value: 45 },
        { name: 'health', value: 62 },
    ]
};

export const MOCK_PARSED_POLICY: DetailedPolicy = {
    policyNumber: 'HOM67890',
    insurer: 'Allstate',
    policyholder: { name: 'John Doe', address: '123 Main St, Anytown, USA' },
    insuredItems: [
        {
            id: 'item_1',
            description: 'Primary Residence - 123 Main St',
            coverages: [
                { type: 'Dwelling', limit: '€300,000' },
                { type: 'Personal Property', limit: '€150,000' },
                { type: 'Liability', limit: '€500,000', deductible: '€1,000' },
                { type: 'Flood', limit: 'Not Covered' }
            ]
        }
    ]
};

export const MOCK_ANALYTICS_DATA: AnalyticsData = [];
const today = new Date();
for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Mock data for campaign 1
    MOCK_ANALYTICS_DATA.push({
        campaignId: 'camp_1',
        date: dateString,
        impressions: Math.floor(Math.random() * 500) + 1000,
        clicks: Math.floor(Math.random() * 50) + 20,
        conversions: Math.floor(Math.random() * 5),
        spend: Math.random() * 15 + 10
    });

    // Mock data for campaign 2
    MOCK_ANALYTICS_DATA.push({
        campaignId: 'camp_2',
        date: dateString,
        impressions: Math.floor(Math.random() * 800) + 1500,
        clicks: Math.floor(Math.random() * 30) + 10,
        conversions: Math.floor(Math.random() * 3),
        spend: Math.random() * 25 + 15
    });
}
