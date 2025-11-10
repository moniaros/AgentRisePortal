// FIX: Add AnalyticsData to the import list from ../types
import { User, Customer, Lead, Policy, PolicyType, UserSystemRole, LicenseStatus, Language, CampaignObjective, TimelineEvent, NewsArticle, Testimonial, UserActivityEvent, AuditLog, AnalyticsRecord, AnalyticsData, ExecutiveData } from '../types';

export const MOCK_USERS: User[] = [
    {
        id: 'user_1',
        agencyId: 'agency_1',
        party: {
            partyName: { firstName: 'John', lastName: 'Doe' },
            contactInfo: { email: 'john.doe@agency1.com', workPhone: '555-0101' },
            profilePhotoUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            signature: 'https://via.placeholder.com/200x80.png?text=John+Doe+Signature',
        },
        partyRole: {
            roleType: UserSystemRole.ADMIN,
            roleTitle: 'Agency Administrator',
            jobTitle: 'Senior Agent',
            permissionsScope: 'agency',
            licenses: [
                { type: 'General Lines', licenseNumber: 'GL-12345', state: 'CA', expirationDate: '2025-12-31', status: LicenseStatus.VALID },
            ]
        }
    },
    {
        id: 'user_2',
        agencyId: 'agency_1',
        party: {
            partyName: { firstName: 'Jane', lastName: 'Smith' },
            contactInfo: { email: 'jane.smith@agency1.com' },
        },
        partyRole: {
            roleType: UserSystemRole.AGENT,
            roleTitle: 'Insurance Agent',
            jobTitle: 'Agent',
            permissionsScope: 'agency',
        }
    },
    {
        id: 'user_3',
        agencyId: 'agency_2',
        party: {
            partyName: { firstName: 'Peter', lastName: 'Jones' },
            contactInfo: { email: 'peter.jones@agency2.com' },
        },
        partyRole: {
            roleType: UserSystemRole.ADMIN,
            roleTitle: 'Agency Administrator',
            permissionsScope: 'agency',
        }
    }
];

const mockTimeline: TimelineEvent[] = [
    { id: 't1', date: '2023-10-15T10:00:00Z', type: 'system', content: 'Customer profile created.', author: 'System' },
    { id: 't2', date: '2023-11-01T14:30:00Z', type: 'policy_update', content: 'Auto policy #A-123 activated.', author: 'John Doe' },
    { id: 't3', date: '2024-01-20T09:15:00Z', type: 'call', content: 'Discussed potential home insurance.', author: 'Jane Smith', annotations: [{id: 'a1', date: '2024-01-20T09:20:00Z', author: 'Jane Smith', content: 'Client is interested in flood coverage.'}] },
];

const mockPolicies: Policy[] = [
    { id: 'p1', policyNumber: 'A-123', type: PolicyType.AUTO, startDate: '2023-11-01', endDate: '2024-10-31', premium: 1200, isActive: true },
    { id: 'p2', policyNumber: 'H-456', type: PolicyType.HOME, startDate: '2022-05-20', endDate: '2023-05-19', premium: 800, isActive: false },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'cust_1', firstName: 'Alice', lastName: 'Williams', email: 'alice.w@example.com', phone: '555-0102', address: '123 Oak St, Anytown', policies: mockPolicies, timeline: mockTimeline, agencyId: 'agency_1', assignedAgentId: 'user_1' },
    { id: 'cust_2', firstName: 'Bob', lastName: 'Brown', email: 'bob.b@example.com', phone: '555-0103', address: '456 Pine St, Anytown', policies: [{ id: 'p3', policyNumber: 'L-789', type: PolicyType.LIFE, startDate: '2023-01-15', endDate: '2033-01-14', premium: 2400, isActive: true }], timeline: [], agencyId: 'agency_1', assignedAgentId: 'user_2' },
    { id: 'cust_3', firstName: 'Charlie', lastName: 'Davis', email: 'charlie.d@example.com', phone: '555-0104', address: '789 Maple St, Anytown', policies: [], timeline: [], agencyId: 'agency_2', assignedAgentId: 'user_3' },
];

export const MOCK_LEADS: Lead[] = [
    { id: 'lead_1', firstName: 'Eve', lastName: 'Miller', email: 'eve.m@example.com', source: 'Facebook Campaign', status: 'new', potentialValue: 1500, createdAt: '2024-07-20T10:00:00Z', agencyId: 'agency_1', campaignId: 'camp_1', policyType: PolicyType.AUTO },
    { id: 'lead_2', firstName: 'Frank', lastName: 'Wilson', email: 'frank.w@example.com', source: 'Website Form', status: 'contacted', potentialValue: 900, createdAt: '2024-07-18T15:00:00Z', agencyId: 'agency_1', campaignId: 'camp_1', policyType: PolicyType.HOME },
    { id: 'lead_3', firstName: 'Grace', lastName: 'Taylor', email: 'grace.t@example.com', source: 'Referral', status: 'closed', potentialValue: 2500, createdAt: '2024-06-10T11:00:00Z', agencyId: 'agency_1', campaignId: 'camp_2', policyType: PolicyType.LIFE, customerId: 'cust_1' },
    { id: 'lead_4', firstName: 'Heidi', lastName: 'Anderson', email: 'heidi.a@example.com', source: 'Google Ads', status: 'new', potentialValue: 1800, createdAt: '2024-07-21T09:00:00Z', agencyId: 'agency_2', campaignId: 'camp_3', policyType: PolicyType.BUSINESS },
];

export const MOCK_NEWS_ARTICLES: NewsArticle[] = [
    { id: 'news_1', title: 'Understanding Your Auto Insurance Policy', summary: 'A deep dive into the common terms and coverages in your auto insurance policy.', content: '<div><p>Full article content goes here...</p></div>', imageUrl: 'https://via.placeholder.com/800x400.png?text=Auto+Insurance', publishedDate: '2024-07-15T00:00:00Z', author: { name: 'Insurance Today', avatarUrl: 'https://via.placeholder.com/50' }, tags: ['auto', 'insurance', 'guide'], agencyId: 'global', seo: { title: 'Guide to Auto Insurance | AgentOS', description: 'Learn about auto insurance.' } },
    { id: 'news_2', title: 'Agency 1 Summer Promotion!', summary: 'We are excited to announce our summer promotion for new and existing clients.', content: '<div><p>Details about the promotion...</p></div>', imageUrl: 'https://via.placeholder.com/800x400.png?text=Summer+Promo', publishedDate: '2024-07-01T00:00:00Z', author: { name: 'John Doe' }, tags: ['promotion', 'savings'], agencyId: 'agency_1', seo: { title: 'Summer Promo | Agency 1', description: 'Save big this summer.' } },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
    { id: 'test_1', authorName: 'Alice Williams', quote: 'Great service and very helpful!', rating: 5, status: 'approved', agencyId: 'agency_1', createdAt: '2024-06-20T00:00:00Z' },
    { id: 'test_2', authorName: 'David Johnson', quote: 'Could be better.', rating: 3, status: 'pending', agencyId: 'agency_1', createdAt: '2024-07-10T00:00:00Z' },
    { id: 'test_3', authorName: 'Bob Brown', quote: 'Fantastic experience, highly recommend!', rating: 5, status: 'approved', agencyId: 'agency_1', createdAt: '2024-05-15T00:00:00Z' },
];

export const MOCK_USER_ACTIVITY: Record<string, UserActivityEvent[]> = {
    'user_1': [
        { id: 'act_1', timestamp: '2024-07-22T09:05:00Z', type: 'login', description: 'Logged in successfully' },
        { id: 'act_2', timestamp: '2024-07-22T09:10:00Z', type: 'action', description: 'Updated customer profile for Alice Williams' },
        { id: 'act_3', timestamp: '2024-07-21T15:30:00Z', type: 'notification', description: 'Received new lead: Eve Miller' },
    ]
};

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log_1', timestamp: '2024-07-01T10:00:00Z', actorName: 'John Doe', action: 'user_invited', targetName: 'jane.smith@agency1.com', details: 'Invited with role: agent', agencyId: 'agency_1' },
];

// Mock data for Analytics page
export const MOCK_ANALYTICS_DATA: AnalyticsData = [
  // ... generate some realistic-looking data
  { date: "2024-07-01", campaignId: "camp_1", impressions: 5000, clicks: 250, conversions: 10, spend: 50 },
  { date: "2024-07-02", campaignId: "camp_1", impressions: 5200, clicks: 260, conversions: 12, spend: 52 },
  { date: "2024-07-01", campaignId: "camp_2", impressions: 8000, clicks: 160, conversions: 5, spend: 80 },
  { date: "2024-07-02", campaignId: "camp_2", impressions: 8100, clicks: 165, conversions: 7, spend: 81 },
];

// Mock data for Executive Dashboard
export const MOCK_EXECUTIVE_DATA: ExecutiveData = {
    agencyGrowth: [
        { month: 'Jan', premium: 50000, policies: 100 },
        { month: 'Feb', premium: 55000, policies: 110 },
        { month: 'Mar', premium: 62000, policies: 125 },
        { month: 'Apr', premium: 60000, policies: 122 },
        { month: 'May', premium: 68000, policies: 135 },
        { month: 'Jun', premium: 75000, policies: 150 },
    ],
    productMix: [
        { name: PolicyType.AUTO, value: 45 },
        { name: PolicyType.HOME, value: 30 },
        { name: PolicyType.LIFE, value: 15 },
        { name: PolicyType.BUSINESS, value: 10 },
    ],
    claimsTrend: [
        { month: 'Jan', submitted: 20, approved: 15, paid: 14 },
        { month: 'Feb', submitted: 25, approved: 18, paid: 18 },
        { month: 'Mar', submitted: 22, approved: 17, paid: 16 },
        { month: 'Apr', submitted: 30, approved: 25, paid: 22 },
        { month: 'May', submitted: 28, approved: 22, paid: 20 },
        { month: 'Jun', submitted: 35, approved: 30, paid: 28 },
    ],
    leadFunnel: [
        { status: 'new', count: 500 },
        { status: 'contacted', count: 400 },
        { status: 'qualified', count: 200 },
        { status: 'closed', count: 50 },
    ],
    campaignRoi: [
        { id: 'camp_1', name: 'Summer Auto Promo', spend: 2500, revenue: 12500 },
        { id: 'camp_2', name: 'Home Insurance Awareness', spend: 4000, revenue: 15000 },
    ],
    riskExposure: [
        { area: 'Auto Claims', exposure: 100000, mitigation: 60000 },
        { area: 'Property Damage', exposure: 150000, mitigation: 80000 },
        { area: 'Liability', exposure: 80000, mitigation: 70000 },
    ]
};