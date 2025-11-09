import { Customer, Lead, PolicyType } from '../types';

const mockLeads: Lead[] = [
  { id: 'lead_1', firstName: 'John', lastName: 'Doe', email: 'john.d@example.com', source: 'Website', status: 'new', potentialValue: 1200, createdAt: new Date('2023-10-26T10:00:00Z').toISOString(), policyType: PolicyType.AUTO, customerId: 'cust_1' },
  { id: 'lead_2', firstName: 'Jane', lastName: 'Smith', email: 'jane.s@example.com', source: 'Referral', status: 'contacted', potentialValue: 2500, createdAt: new Date('2023-10-25T14:30:00Z').toISOString(), policyType: PolicyType.HOME, customerId: 'cust_2' },
  { id: 'lead_3', firstName: 'Peter', lastName: 'Jones', email: 'peter.j@example.com', source: 'Facebook', status: 'qualified', potentialValue: 800, createdAt: new Date('2023-10-24T09:00:00Z').toISOString(), policyType: PolicyType.LIFE, customerId: undefined },
];

const mockCustomers: Customer[] = [
  {
    id: 'cust_1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.d@example.com',
    phone: '123-456-7890',
    address: '123 Main St, Anytown, USA',
    dateOfBirth: '1985-05-15',
    policies: [
      { id: 'pol_1', type: PolicyType.AUTO, policyNumber: 'AUTO-12345', insurer: 'InsureCo', premium: 120, startDate: '2023-01-01', endDate: '2024-01-01', isActive: true },
    ],
    timeline: [
      { id: 'tl_1', date: new Date('2023-10-26T10:00:00Z').toISOString(), type: 'note', title: 'Customer Created', content: 'Created from lead.', author: 'System' }
    ]
  },
  {
    id: 'cust_2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.s@example.com',
    phone: '987-654-3210',
    address: '456 Oak Ave, Anytown, USA',
    dateOfBirth: '1990-08-22',
    policies: [
      { id: 'pol_2', type: PolicyType.HOME, policyNumber: 'HOME-67890', insurer: 'SafeGuard', premium: 200, startDate: '2023-05-01', endDate: '2024-05-01', isActive: true },
      { id: 'pol_3', type: PolicyType.AUTO, policyNumber: 'AUTO-09876', insurer: 'InsureCo', premium: 90, startDate: '2023-06-15', endDate: '2024-06-15', isActive: true },
    ],
    timeline: [
      { id: 'tl_2', date: new Date('2023-10-25T14:30:00Z').toISOString(), type: 'note', title: 'Customer Created', content: 'Created from lead.', author: 'System' }
    ]
  },
];


const simulateApiCall = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data))); // Deep copy to simulate immutable data
    }, delay);
  });
};

export const fetchDashboardData = async () => {
  // Simulate fetching data for the dashboard
  await simulateApiCall(null, 800);
  return {
    newLeadsCount: 5,
    monthlyRevenue: 12540.50,
    policyDistribution: [
      { name: 'AUTO', value: 150 },
      { name: 'HOME', value: 85 },
      { name: 'LIFE', value: 60 },
      { name: 'HEALTH', value: 75 },
    ],
  };
};

export const fetchLeads = (): Promise<Lead[]> => {
    return simulateApiCall(mockLeads);
};

export const fetchCustomers = (): Promise<Customer[]> => {
    return simulateApiCall(mockCustomers);
};

export const fetchCustomerById = (id: string): Promise<Customer | undefined> => {
    const customer = mockCustomers.find(c => c.id === id);
    return simulateApiCall(customer);
}
