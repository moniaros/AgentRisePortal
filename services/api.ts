import { MOCK_USERS, MOCK_LEADS, MOCK_CUSTOMERS, MOCK_NEWS_ARTICLES, MOCK_TESTIMONIALS, MOCK_USER_ACTIVITY, MOCK_AUDIT_LOGS, MOCK_ANALYTICS_DATA, MOCK_EXECUTIVE_DATA } from '../data/mockData';
import { User, Lead, Customer, DetailedPolicy, NewsArticle, Testimonial, UserActivityEvent, AuditLog, AnalyticsData, ExecutiveData } from '../types';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Gap Analysis
export const fetchParsedPolicy = async (): Promise<DetailedPolicy> => {
    await simulateDelay(1000);
    return {
        policyNumber: 'HO-987654',
        insurer: 'SecureHome Insurance',
        policyholder: {
            name: 'Jane Doe',
            address: '456 Oak Avenue, Springfield, USA'
        },
        insuredItems: [
            {
                id: 'item-1',
                description: 'Primary Residence (Single Family Home)',
                coverages: [
                    { type: 'Dwelling', limit: '$300,000' },
                    { type: 'Personal Property', limit: '$150,000', deductible: '$1,000' },
                    { type: 'Liability', limit: '$500,000' },
                    { type: 'Loss of Use', limit: '$30,000' },
                ]
            }
        ]
    };
};

// User Management
export const fetchUsers = async (): Promise<User[]> => {
    await simulateDelay(500);
    return MOCK_USERS;
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
    await simulateDelay(500);
    return MOCK_AUDIT_LOGS;
};

// CRM Data (used by useCrmData hook)
export const fetchCustomers = async (): Promise<Customer[]> => {
    await simulateDelay(500);
    return MOCK_CUSTOMERS;
};

export const fetchLeads = async (): Promise<Lead[]> => {
    await simulateDelay(500);
    return MOCK_LEADS;
};

// Analytics
export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    await simulateDelay(800);
    return MOCK_ANALYTICS_DATA;
};

// Executive Dashboard
export const fetchExecutiveData = async (): Promise<ExecutiveData> => {
    await simulateDelay(1200);
    // Ensure data consistency by creating a fresh copy
    const executiveData: ExecutiveData = JSON.parse(JSON.stringify(MOCK_EXECUTIVE_DATA));
    // The field was renamed in the mock data source, ensuring it's correct here.
    return executiveData;
};


// News
export const fetchNewsArticles = async (): Promise<NewsArticle[]> => {
    await simulateDelay(600);
    return MOCK_NEWS_ARTICLES;
};

// Testimonials
export const fetchTestimonials = async (): Promise<Testimonial[]> => {
    await simulateDelay(400);
    return MOCK_TESTIMONIALS;
};

// User Activity
export const fetchUserActivity = async (userId: string): Promise<UserActivityEvent[]> => {
    await simulateDelay(300);
    return MOCK_USER_ACTIVITY[userId] || [];
};