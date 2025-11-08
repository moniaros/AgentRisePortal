import { Lead, Customer } from '../types';

const API_DELAY = 300; // Simulate network latency

// Helper to simulate a fetch call with a delay
const delayedFetch = (url: string) => {
    return new Promise(resolve => {
        setTimeout(async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                resolve(data);
            } catch (error) {
                console.error("Fetch error:", error);
                // In a real app, you'd reject the promise here
                // For this simulation, we resolve with an empty array/object to prevent crashes
                resolve(url.includes('s.json') ? [] : {}); 
            }
        }, API_DELAY);
    });
};

// Fetch all CRM leads
export const fetchLeads = (): Promise<Lead[]> => {
  return delayedFetch('./data/leads.json') as Promise<Lead[]>;
};

// Fetch all social media leads
export const fetchSocialLeads = (): Promise<Lead[]> => {
    return delayedFetch('./data/socialLeads.json') as Promise<Lead[]>;
};

// Fetch all customers
export const fetchCustomers = (): Promise<Customer[]> => {
  return delayedFetch('./data/customers.json') as Promise<Customer[]>;
};

// Fetch a single customer by ID
export const fetchCustomerById = async (id: string): Promise<Customer | undefined> => {
    const customers = await delayedFetch('./data/customers.json') as Customer[];
    return customers.find(c => c.id === id);
};

// Fetch dashboard data
export const fetchDashboardData = (): Promise<{
  newLeadsCount: number;
  monthlyRevenue: number;
  policyDistribution: { name: string; value: number }[];
}> => {
  return delayedFetch('./data/dashboard.json') as Promise<{
    newLeadsCount: number;
    monthlyRevenue: number;
    policyDistribution: { name: string; value: number }[];
  }>;
};
