import { Customer, Lead, PolicyType, AnalyticsData } from '../types';

// Mock data
const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St, Anytown, USA',
    dateOfBirth: '1985-05-15',
    policies: [
      { id: 'pol_1', type: PolicyType.AUTO, policyNumber: 'AUT12345', premium: 1200, startDate: '2023-01-01', endDate: '2024-01-01', isActive: true, insurer: 'SafeAuto' },
      { id: 'pol_2', type: PolicyType.HOME, policyNumber: 'HOM67890', premium: 800, startDate: '2023-06-01', endDate: '2024-06-01', isActive: true, insurer: 'HomeGuard' },
    ],
    timeline: [
        { id: 'tl_1', date: '2023-10-26T10:00:00Z', type: 'note', title: 'Initial contact', content: 'Customer interested in life insurance.', author: 'Agent' }
    ]
  },
];

const mockLeads: Lead[] = [
  { id: 'lead_1', firstName: 'Jane', lastName: 'Smith', email: 'jane.s@example.com', phone: '987-654-3210', source: 'Facebook', status: 'new', policyType: PolicyType.LIFE, potentialValue: 500, createdAt: new Date().toISOString(), customerId: 'cust_1' },
  { id: 'lead_2', firstName: 'Peter', lastName: 'Jones', email: 'p.jones@example.com', phone: '555-555-5555', source: 'Website Form', status: 'contacted', policyType: PolicyType.AUTO, potentialValue: 750, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

export const fetchDashboardData = async () => {
    return new Promise<{
        newLeadsCount: number;
        monthlyRevenue: number;
        policyDistribution: { name: string; value: number }[];
    }>(resolve => {
        setTimeout(() => {
            resolve({
                newLeadsCount: 12,
                monthlyRevenue: 15400,
                policyDistribution: [
                    { name: 'auto', value: 45 },
                    { name: 'home', value: 30 },
                    { name: 'life', value: 15 },
                    { name: 'health', value: 10 },
                ],
            });
        }, 500);
    });
};

export const fetchLeads = async (): Promise<Lead[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockLeads);
        }, 500);
    });
};

export const fetchCustomers = async (): Promise<Customer[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockCustomers);
        }, 500);
    });
};

export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    try {
        const response = await fetch('/data/analytics.json');
        if (!response.ok) {
            throw new Error('Failed to fetch analytics data');
        }
        const data = await response.json();
        return data as AnalyticsData;
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        return []; // Return empty array on error
    }
};