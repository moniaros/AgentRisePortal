import { Customer, Lead, User, PolicyType, UserSystemRole, Language, CampaignObjective, AuditLog, AnalyticsRecord, ExecutiveData, LeadStatus, NewsArticle, Testimonial, UserActivityEvent } from '../types';

export const MOCK_USERS: User[] = [
    { 
        id: 'user_1', 
        agencyId: 'agency_1',
        party: {
            partyName: { firstName: 'John', lastName: 'Agent' },
            contactInfo: {
                email: 'john.agent@example.com',
                workPhone: '555-0100-101',
                mobilePhone: '555-0199-101'
            },
            addressInfo: {
                fullAddress: 'Scranton Branch'
            },
            profilePhotoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkY2RjZCI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTRjLTIuMzMgMC00LjMyLS45Ni01LjgzLTIuNTFBMTAuOTkgMTAuOTkgMCAwMTEyIDIwYTQuNDggNC40OCAwIDAwMy44My0yLjUxQzE2LjMyIDE5LjA0IDE0LjMzIDIwIDEyIDIweiIvPjwvc3ZnPg==',
            signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAyMDAgNjAiPjx0ZXh0IHg9IjEwIiB5PSI0NSIgZm9udC1mYW1pbHk9ImN1cnNpdmUiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiMzMzMiPkpvaG4gQWdlbnQ8L3RleHQ+PC9zdmc+',
        },
        partyRole: {
            roleType: UserSystemRole.AGENT,
            roleTitle: 'Senior Insurance Agent',
            permissionsScope: 'agency',
            jobTitle: 'Senior Agent',
            department: 'Sales',
            licenses: [
                { type: 'Life & Health', licenseNumber: 'LH-12345', expirationDate: '2025-12-31', status: 'valid' },
                { type: 'Property & Casualty', licenseNumber: 'PC-67890', expirationDate: '2023-11-30', status: 'expired' }
            ]
        }
    },
    { 
        id: 'user_2', 
        agencyId: 'agency_1',
        party: {
            partyName: { firstName: 'Jane', lastName: 'Admin' },
            contactInfo: {
                email: 'moniaros@gmail.com',
                workPhone: '555-0100-102'
            },
            addressInfo: {
                fullAddress: 'Scranton Branch'
            },
            profilePhotoUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkY2RjZCI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTRjLTIuMzMgMC00LjMyLS45Ni01LjgzLTIuNTFBMTAuOTkgMTAuOTkgMCAwMTEyIDIwYTQuNDggNC40OCAwIDAwMy44My0yLjUxQzE2LjMyIDE5LjA0IDE0LjMzIDIwIDEyIDIweiIvPjwvc3ZnPg==',
            signature: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAyMDAgNjAiPjx0ZXh0IHg9IjEwIiB5PSI0NSIgZm9udC1mYW1pbHk9ImN1cnNpdmUiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiMzMzMiPkphbmUgQWRtaW48L3RleHQ+PC9zdmc+',
        },
        partyRole: {
            roleType: UserSystemRole.ADMIN,
            roleTitle: 'Compliance Officer',
            permissionsScope: 'agency',
            jobTitle: 'Office Manager',
            department: 'Administration',
            licenses: [
                { type: 'Notary Public', licenseNumber: 'NP-55555', expirationDate: '2026-06-01', status: 'valid' }
            ]
        }
    },
    { 
        id: 'user_3', 
        agencyId: 'agency_2',
        party: {
            partyName: { firstName: 'Peter', lastName: 'Broker' },
            contactInfo: {
                email: 'peter.broker@example.com',
                workPhone: '555-0200-201'
            },
            addressInfo: {
                fullAddress: 'Stamford Branch'
            }
        },
        partyRole: {
            roleType: UserSystemRole.AGENT,
            roleTitle: 'Commercial Broker',
            permissionsScope: 'agency',
            jobTitle: 'Broker',
            department: 'Commercial Lines',
            licenses: []
        }
    },
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

export const MOCK_TESTIMONIALS: Testimonial[] = [
    {
        id: 'test_1',
        authorName: 'Michael Scott',
        authorPhotoUrl: 'https://i.pravatar.cc/150?u=michael.scott@dundermifflin.com',
        quote: 'Fantastic service! John Agent found me the perfect coverage for my car and home. The process was surprisingly easy and fast. Highly recommended!',
        rating: 5,
        status: 'approved',
        agencyId: 'agency_1',
        createdAt: '2024-08-01T10:00:00Z',
    },
    {
        id: 'test_2',
        authorName: 'Diana Prince',
        authorPhotoUrl: 'https://i.pravatar.cc/150?u=diana.p@email.com',
        quote: 'As a new client, I was impressed by the professionalism and attention to detail. Jane Admin helped me understand all the nuances of my health policy.',
        rating: 5,
        status: 'approved',
        agencyId: 'agency_1',
        createdAt: '2024-08-15T14:30:00Z',
    },
    {
        id: 'test_3',
        authorName: 'Alice Smith',
        authorPhotoUrl: 'https://i.pravatar.cc/150?u=alice.s@email.com',
        quote: 'Good experience overall. The onboarding was smooth.',
        rating: 4,
        status: 'approved',
        agencyId: 'agency_1',
        createdAt: '2024-09-01T11:00:00Z',
    },
    {
        id: 'test_4',
        authorName: 'Bob Johnson',
        quote: 'The team was very helpful. They answered all my questions about home insurance and found me a great rate. I will be recommending them to my friends and family.',
        rating: 5,
        status: 'pending',
        agencyId: 'agency_1',
        createdAt: '2024-09-20T09:00:00Z',
    },
    {
        id: 'test_5',
        authorName: 'Charlie Brown',
        authorPhotoUrl: 'https://i.pravatar.cc/150?u=charlie.b@email.com',
        quote: 'The service is okay.',
        rating: 3,
        status: 'pending',
        agencyId: 'agency_1',
        createdAt: '2024-09-21T16:20:00Z',
    },
    {
        id: 'test_6',
        authorName: 'John Doe',
        quote: 'Excellent service from Peter Broker. He really knows his stuff!',
        rating: 5,
        status: 'approved',
        agencyId: 'agency_2',
        createdAt: '2024-08-05T12:00:00Z',
    }
];

export const MOCK_USER_ACTIVITY: UserActivityEvent[] = [
    { id: 'act_1', userId: 'user_1', timestamp: new Date().toISOString(), type: 'login', description: 'Logged in successfully.', details: { ipAddress: '192.168.1.1' }, agencyId: 'agency_1' },
    { id: 'act_2', userId: 'user_1', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'action', description: 'Updated customer profile for Michael Scott.', details: { targetId: 'cust_1' }, agencyId: 'agency_1' },
    { id: 'act_3', userId: 'user_1', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'notification', description: 'Policy AUT12345 is due for renewal in 30 days.', details: { targetId: 'pol_1' }, agencyId: 'agency_1' },
    { id: 'act_4', userId: 'user_1', timestamp: new Date(Date.now() - 172800000).toISOString(), type: 'login', description: 'Logged in successfully.', details: { ipAddress: '192.168.1.5' }, agencyId: 'agency_1' },
    { id: 'act_5', userId: 'user_2', timestamp: new Date().toISOString(), type: 'login', description: 'Logged in successfully.', details: { ipAddress: '10.0.0.5' }, agencyId: 'agency_1' },
    { id: 'act_6', userId: 'user_2', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), type: 'action', description: 'Invited new user peter.pan@example.com.', agencyId: 'agency_1' },
];

export const MOCK_NEWS_ARTICLES: NewsArticle[] = [
    {
        id: 'q3-2024-updates',
        title: 'Platform Updates for Q3 2024',
        summary: 'Discover the latest features and improvements we\'ve rolled out this quarter, including the new Executive Dashboard and enhanced AI capabilities.',
        content: '<p>This quarter has been packed with updates to enhance your productivity and provide deeper insights into your agency\'s performance.</p><h3>Key Highlights:</h3><ul><li><strong>Executive Dashboard:</strong> A new high-level overview for agency owners to track growth, product mix, and campaign ROI.</li><li><strong>AI Gap Analysis v2:</strong> Our AI engine is now faster and more accurate, providing even better cross-sell and upsell recommendations.</li><li><strong>UI Enhancements:</strong> We\'ve refreshed several components for a cleaner and more intuitive user experience.</li></ul><p>We are committed to continuously improving AgentOS to meet your needs. Stay tuned for more exciting updates in Q4!</p>',
        author: {
            name: 'AgentOS Team',
            avatarUrl: 'https://i.pravatar.cc/150?u=agentos'
        },
        publishedDate: '2024-09-15T10:00:00Z',
        tags: ['product update', 'new features', 'ai'],
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop',
        seo: {
            title: 'Q3 2024 Platform Updates | AgentOS',
            description: 'Learn about the new features in AgentOS for Q3 2024, including the Executive Dashboard and AI improvements.'
        },
        agencyId: 'global'
    },
    {
        id: 'cyber-insurance-trends',
        title: 'The Rise of Cyber Insurance: Are Your Clients Covered?',
        summary: 'Cyber threats are evolving. This article explores the growing importance of cyber insurance for small and medium-sized businesses and how you can start the conversation with your clients.',
        content: '<p>In today\'s digital world, no business is safe from cyber threats. From data breaches to ransomware attacks, the financial and reputational damage can be devastating.</p><p>As their trusted advisor, it\'s crucial to educate your clients on the importance of cyber liability insurance. This isn\'t just for large corporations anymore; small businesses are often seen as easier targets.</p><h3>Conversation Starters:</h3><ul><li>"How do you currently protect sensitive customer data?"</li><li>"What would be the financial impact if your systems were down for a week?"</li><li>"Are you aware of the notification laws in your state in case of a data breach?"</li></ul><p>Positioning yourself as a knowledgeable resource on cyber risk can open up significant opportunities and provide immense value to your clients.</p>',
        author: {
            name: 'Jane Admin',
            avatarUrl: 'https://i.pravatar.cc/150?u=moniaros@gmail.com'
        },
        publishedDate: '2024-09-10T14:30:00Z',
        tags: ['industry trends', 'cyber insurance', 'sme'],
        imageUrl: 'https://images.unsplash.com/photo-1555949963-ff98db7ffbae?q=80&w=1770&auto=format&fit=crop',
        seo: {
            title: 'The Importance of Cyber Insurance for SMEs',
            description: 'Learn why cyber insurance is critical for small and medium-sized businesses and how to discuss it with your clients.'
        },
        agencyId: 'agency_1'
    },
    {
        id: 'welcome-alpha-agency',
        title: 'Welcome New Partner Agency!',
        summary: 'A special welcome to our newest partner agency. We are excited to have you onboard and look forward to helping you grow your business.',
        content: '<p>We are thrilled to welcome the entire team at your agency to the AgentOS platform! We are confident that our tools will empower your agents to be more efficient and successful.</p><p>Your dedicated account manager will be reaching out to schedule your team\'s onboarding session. Welcome aboard!</p>',
        author: {
            name: 'AgentOS Team',
            avatarUrl: 'https://i.pravatar.cc/150?u=agentos'
        },
        publishedDate: '2024-09-01T09:00:00Z',
        tags: ['announcement', 'new client'],
        imageUrl: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1769&auto=format&fit=crop',
        seo: {
            title: 'Welcome New Partner!',
            description: 'AgentOS welcomes a new partner agency to the platform.'
        },
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