import { User, UserSystemRole, LicenseStatus, Customer, PolicyType, Lead, ReminderLogEntry, UserActivityEvent, NewsArticle, Testimonial, Policy, Coverage, TimelineEvent, LeadStatus } from '../types';

export const MOCK_USERS: User[] = [
    {
        id: 'user_1',
        agencyId: 'agency_1',
        party: {
            partyName: { firstName: 'John', lastName: 'Agent' },
            contactInfo: { email: 'john.agent@agency1.com', workPhone: '555-0101', mobilePhone: '555-0201' },
            addressInfo: { fullAddress: '123 Main St, Anytown, USA' },
            profilePhotoUrl: 'https://i.pravatar.cc/150?u=john.agent@agency1.com',
            signature: 'https://via.placeholder.com/200x50.png?text=John+Agent+Signature',
        },
        partyRole: {
            roleType: UserSystemRole.AGENT,
            roleTitle: 'Insurance Agent',
            jobTitle: 'Senior Agent',
            department: 'Personal Lines',
            permissionsScope: 'agency',
        }
    },
    {
        id: 'user_2',
        agencyId: 'agency_1',
        party: {
            partyName: { firstName: 'Jane', lastName: 'Admin' },
            contactInfo: { email: 'jane.admin@agency1.com', workPhone: '555-0102' },
            addressInfo: { fullAddress: '123 Main St, Anytown, USA' },
            profilePhotoUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
        },
        partyRole: {
            roleType: UserSystemRole.ADMIN,
            roleTitle: 'Administrator',
            permissionsScope: 'agency',
            licenses: [
                { type: 'Property & Casualty', licenseNumber: 'PC12345', state: 'CA', expirationDate: '2025-12-31', status: LicenseStatus.VALID },
                { type: 'Life & Health', licenseNumber: 'LH67890', state: 'CA', expirationDate: '2023-12-31', status: LicenseStatus.EXPIRED },
            ]
        }
    },
];


const mockAutoCoverages: Coverage[] = [
    { type: 'Bodily Injury Liability', limit: '100k/300k', deductible: 'N/A' },
    { type: 'Property Damage Liability', limit: '50k', deductible: 'N/A' },
    { type: 'Collision', limit: 'ACV', deductible: '$500' },
    { type: 'Comprehensive', limit: 'ACV', deductible: '$500' },
];

const mockHomeCoverages: Coverage[] = [
    { type: 'Dwelling', limit: '$350,000' },
    { type: 'Personal Property', limit: '$175,000' },
    { type: 'Liability', limit: '$300,000' },
];


const mockTimeline: TimelineEvent[] = [
    { id: 'evt_1', date: '2024-07-15T10:00:00Z', type: 'system', content: 'Customer profile created.', author: 'System' },
    { id: 'evt_2', date: '2024-07-16T14:30:00Z', type: 'call', content: 'Initial consultation call. Discussed auto and home bundling options.', author: 'John Agent' }
];

export const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'cust_1',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.j@example.com',
        phone: '555-111-2222',
        address: '456 Oak Ave, Springfield',
        agencyId: 'agency_1',
        assignedAgentId: 'user_1',
        communicationPreferences: ['email'],
        policies: [
            { id: 'pol_1', type: PolicyType.AUTO, policyNumber: 'AUTO-001', premium: 1200, startDate: '2024-01-15', endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], isActive: true, insurer: 'AutoProtect Ins.', coverages: mockAutoCoverages },
            { id: 'pol_2', type: PolicyType.HOME, policyNumber: 'HOME-001', premium: 800, startDate: '2024-02-01', endDate: '2025-02-01', isActive: true, insurer: 'SecureHome Ins.', coverages: mockHomeCoverages },
        ],
        timeline: mockTimeline
    },
];

export const MOCK_LEADS: Lead[] = [
    // FIX: 'LeadStatus' is a type, not a value. Use string literals instead.
    { id: 'lead_1', firstName: 'Bob', lastName: 'Smith', email: 'bob.s@example.com', source: 'Facebook Ad', status: 'new', potentialValue: 1500, createdAt: new Date().toISOString(), policyType: PolicyType.AUTO, agencyId: 'agency_1' },
    // FIX: 'LeadStatus' is a type, not a value. Use string literals instead.
    { id: 'lead_2', firstName: 'Charlie', lastName: 'Brown', email: 'charlie.b@example.com', source: 'Website Form', status: 'contacted', potentialValue: 2200, createdAt: new Date(Date.now() - 2 * 24*60*60*1000).toISOString(), policyType: PolicyType.HOME, agencyId: 'agency_1' },
];

export const MOCK_REMINDER_LOG: ReminderLogEntry[] = [];