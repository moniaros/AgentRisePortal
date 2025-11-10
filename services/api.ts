import { DetailedPolicy, AnalyticsData, User, AuditLog, ExecutiveData, NewsArticle, Testimonial, UserActivityEvent, PolicyType, LeadStatus } from '../types';
import { MOCK_USERS, MOCK_CUSTOMERS, MOCK_LEADS } from '../data/mockData';

// Mock API functions
export const fetchDashboardData = async (): Promise<any> => {
    return new Promise(resolve => setTimeout(() => resolve({
        newLeadsCount: 12,
        newLeadsThisMonth: { current: 45, previous: 38 },
        totalPoliciesInForce: { current: MOCK_CUSTOMERS.reduce((acc, c) => acc + c.policies.length, 0), previous: 1210 },
        onTimeRenewalRate: 92,
        dailyLeadTrend: [{ date: 'd1', count: 2 }, { date: 'd2', count: 3 }, { date: 'd3', count: 1 }, { date: 'd4', count: 5 }, { date: 'd5', count: 4 }],
        conversionFunnel: { leads: 120, quotesIssued: 80, policiesBound: 50 },
        expiringPolicies: [
            { customerId: 'cust_1', customerName: 'Alice Johnson', policyNumber: 'AUTO-001', endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }
        ]
    }), 500));
};

export const fetchParsedPolicy = async (): Promise<DetailedPolicy> => {
    return new Promise(resolve => setTimeout(() => resolve({
        policyholder: { name: 'John Doe', address: '456 Oak Ave, Anytown, USA' },
        policyNumber: 'HOME-002',
        insurer: 'SecureHome Insurance',
        insuredItems: [
            { id: 'item1', description: 'Primary Residence', coverages: [{ type: 'Dwelling', limit: '$300,000', deductible: '$1000' }, {type: 'Liability', limit: '$500,000'}] }
        ]
    }), 500));
};

export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    return new Promise(resolve => setTimeout(() => resolve([]), 500));
};

export const fetchUsers = async (): Promise<User[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_USERS), 500));
}

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
     return new Promise(resolve => setTimeout(() => resolve([]), 500));
}

export const fetchExecutiveData = async (): Promise<ExecutiveData> => {
    return new Promise(resolve => setTimeout(() => resolve({
        agencyGrowth: [
            { month: 'Jan', premium: 12000, policies: 15 },
            { month: 'Feb', premium: 15000, policies: 18 },
            { month: 'Mar', premium: 18000, policies: 22 },
        ], 
        productMix: [
            { name: PolicyType.AUTO, value: 45 },
            { name: PolicyType.HOME, value: 35 },
            { name: PolicyType.LIFE, value: 15 },
            { name: PolicyType.BUSINESS, value: 5 },
        ], 
        claimsTrend: [
            { month: 'Jan', submitted: 5, approved: 4, paid: 15000 },
            { month: 'Feb', submitted: 8, approved: 6, paid: 25000 },
            { month: 'Mar', submitted: 6, approved: 6, paid: 18000 },
        ], 
        leadFunnel: [
            // FIX: 'LeadStatus' is a type, not a value. Use string literals instead.
            { status: 'new', count: 120 },
            { status: 'contacted', count: 90 },
            { status: 'qualified', count: 60 },
            { status: 'closed', count: 40 },
        ], 
        campaignRoi: [
            {id: 'camp_1', name: 'Summer Auto Promo', spend: 500, revenue: 2500},
            {id: 'camp_2', name: 'Home Security Campaign', spend: 800, revenue: 3200},
        ], 
        riskExposure: [
            {area: 'Wildfire', exposure: 1500000, mitigation: 800000},
            {area: 'Flood', exposure: 800000, mitigation: 600000},
            {area: 'Theft', exposure: 1200000, mitigation: 1100000},
        ]
    }), 500));
}

export const fetchNewsArticles = async (): Promise<NewsArticle[]> => {
     return new Promise(resolve => setTimeout(() => resolve([]), 500));
}

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
     return new Promise(resolve => setTimeout(() => resolve([]), 500));
}

export const fetchUserActivity = async (userId: string): Promise<UserActivityEvent[]> => {
    return new Promise(resolve => setTimeout(() => resolve([]), 500));
}