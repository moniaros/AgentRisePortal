import { AnalyticsData, AuditLog, Customer, Lead, PolicyType, User, UserRole } from '../types';

const MOCK_DELAY = 500;

// --- MOCK DATA ---
const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'cust_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        address: '123 Main St, Anytown, USA',
        dateOfBirth: '1985-05-15',
        policies: [
            { id: 'pol_1', type: PolicyType.AUTO, policyNumber: 'AU12345', insurer: 'AutoInsure', premium: 1200, startDate: '2024-01-01', endDate: '2025-01-01', isActive: true },
            { id: 'pol_2', type: PolicyType.HOME, policyNumber: 'HO67890', insurer: 'HomeGuard', premium: 800, startDate: '2023-06-15', endDate: '2024-06-15', isActive: false },
        ],
        timeline: [
            { id: 'tl_1', date: '2024-05-20T10:00:00Z', type: 'call', title: 'Follow-up Call', content: 'Discussed renewal for home policy.', author: 'Agent' }
        ],
        agencyId: 'agency_1'
    },
    {
        id: 'cust_2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '987-654-3210',
        address: '456 Oak Ave, Otherville, USA',
        dateOfBirth: '1990-11-22',
        policies: [
             { id: 'pol_3', type: PolicyType.HEALTH, policyNumber: 'HE54321', insurer: 'HealthWell', premium: 3000, startDate: '2024-03-01', endDate: '2025-03-01', isActive: true },
        ],
        timeline: [],
        agencyId: 'agency_1'
    },
];

const MOCK_LEADS: Lead[] = [
    { id: 'lead_1', firstName: 'Michael', lastName: 'Brown', email: 'mbrown@example.com', phone: '555-111-2222', source: 'Facebook', status: 'new', policyType: PolicyType.AUTO, potentialValue: 1500, createdAt: '2024-07-20T14:00:00Z', customerId: undefined, agencyId: 'agency_1', campaignId: 'camp_1' },
    { id: 'lead_2', firstName: 'Emily', lastName: 'Jones', email: 'ejones@example.com', phone: '555-222-3333', source: 'Website', status: 'contacted', policyType: PolicyType.HOME, potentialValue: 950, createdAt: '2024-07-19T11:30:00Z', customerId: undefined, agencyId: 'agency_1' },
    { id: 'lead_3', firstName: 'Chris', lastName: 'Wilson', email: 'cwilson@example.com', phone: '555-333-4444', source: 'Referral', status: 'qualified', policyType: PolicyType.LIFE, potentialValue: 2200, createdAt: '2024-07-18T09:00:00Z', customerId: 'cust_3_placeholder', agencyId: 'agency_1' },
    { id: 'lead_4', firstName: 'Sarah', lastName: 'Davis', email: 'sdavis@example.com', phone: '555-444-5555', source: 'Instagram', status: 'closed', policyType: PolicyType.AUTO, potentialValue: 1300, createdAt: '2024-07-15T16:45:00Z', customerId: 'cust_4_placeholder', agencyId: 'agency_1', campaignId: 'camp_2' },
    { id: 'lead_5', firstName: 'David', lastName: 'Miller', email: 'dmiller@example.com', phone: '555-555-6666', source: 'Facebook', status: 'rejected', policyType: PolicyType.HEALTH, potentialValue: 3100, createdAt: '2024-07-12T10:00:00Z', customerId: undefined, agencyId: 'agency_1', campaignId: 'camp_1' },
];

const MOCK_USERS: User[] = [
    { id: 'user_1', name: 'Admin User', email: 'admin@alpha.com', role: 'admin', agencyId: 'agency_1' },
    { id: 'user_2', name: 'Agent Bob', email: 'bob@alpha.com', role: 'agent', agencyId: 'agency_1' },
    { id: 'user_3', name: 'Admin Beta', email: 'admin@beta.com', role: 'admin', agencyId: 'agency_2' },
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log_1', timestamp: '2024-07-21T10:00:00Z', actorName: 'Admin User', action: 'user_invited', targetName: 'bob@alpha.com', details: 'Invited with role: agent', agencyId: 'agency_1' },
    { id: 'log_2', timestamp: '2024-07-20T15:30:00Z', actorName: 'Admin User', action: 'role_changed', targetName: 'Agent Bob', details: 'Role changed from agent to admin', agencyId: 'agency_1' },
];

// --- API FUNCTIONS ---

export const fetchDashboardData = async () => {
    return new Promise<{ newLeadsCount: number; monthlyRevenue: number; policyDistribution: { name: string; value: number }[] }>(resolve => {
        setTimeout(() => {
            resolve({
                newLeadsCount: 12,
                monthlyRevenue: 25400,
                policyDistribution: [
                    { name: 'auto', value: 45 },
                    { name: 'home', value: 28 },
                    { name: 'life', value: 15 },
                    { name: 'health', value: 22 },
                ]
            });
        }, MOCK_DELAY);
    });
};

export const fetchLeads = async (): Promise<Lead[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_LEADS), MOCK_DELAY);
    });
};

export const fetchCustomers = async (): Promise<Customer[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_CUSTOMERS), MOCK_DELAY);
    });
};

export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const data: AnalyticsData = [];
            const campaigns = ['camp_1', 'camp_2', 'camp_3'];
            for (let i = 0; i < 90; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                for (const campId of campaigns) {
                     data.push({
                        date: dateString,
                        campaignId: campId,
                        impressions: Math.floor(Math.random() * 2000) + 500,
                        clicks: Math.floor(Math.random() * 100) + 10,
                        conversions: Math.floor(Math.random() * 10),
                        spend: Math.random() * 50 + 10,
                    });
                }
            }
            resolve(data);
        }, MOCK_DELAY);
    });
}

export const fetchUsers = async (): Promise<User[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_USERS), MOCK_DELAY);
    });
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_AUDIT_LOGS), MOCK_DELAY);
    });
};
