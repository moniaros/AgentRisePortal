import { MOCK_CUSTOMERS, MOCK_LEADS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_ANALYTICS_DATA, MOCK_EXECUTIVE_DATA, MOCK_NEWS_ARTICLES, MOCK_TESTIMONIALS, MOCK_USER_ACTIVITY, MOCK_KPI_DATA } from '../data/mockData';
import { DetailedPolicy, AnalyticsData, User, AuditLog, ExecutiveData, NewsArticle, Testimonial, UserActivityEvent, AutomationRule } from '../types';

const SIMULATED_DELAY = 500;

export const fetchDashboardData = async () => {
    return new Promise<{
        newLeadsCount: number;
        monthlyRevenue: number;
        policyDistribution: { name: string; value: number }[];
        totalPoliciesInForce: { current: number; previous: number; };
    }>(resolve => {
        setTimeout(() => {
            // FIX: Explicitly type the accumulator for the reduce function to ensure correct type inference.
            const policyDist = MOCK_CUSTOMERS.flatMap(c => c.policies).reduce<Record<string, number>>((acc, policy) => {
                acc[policy.type] = (acc[policy.type] || 0) + 1;
                return acc;
            }, {});
            
            resolve({
                newLeadsCount: MOCK_LEADS.filter(l => l.status === 'new').length,
                monthlyRevenue: MOCK_CUSTOMERS.flatMap(c => c.policies).reduce((sum, p) => sum + p.premium, 0) / 12,
                policyDistribution: Object.entries(policyDist).map(([name, value]) => ({ name, value })),
                totalPoliciesInForce: MOCK_KPI_DATA.totalPoliciesInForce,
            });
        }, SIMULATED_DELAY);
    });
};

export const fetchParsedPolicy = async (): Promise<DetailedPolicy> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                policyNumber: 'HOM-987654321',
                insurer: 'SecureHome Insurance Co.',
                policyholder: {
                    name: 'Jane Doe',
                    address: '123 Main St, Anytown, USA 12345'
                },
                insuredItems: [
                    {
                        id: 'item1',
                        description: 'Primary Dwelling (Single Family Home)',
                        coverages: [
                            { type: 'Dwelling Coverage (A)', limit: '€350,000' },
                            { type: 'Other Structures (B)', limit: '€35,000' },
                            { type: 'Personal Property (C)', limit: '€175,000' },
                            { type: 'Liability', limit: '€300,000' },
                            { type: 'Medical Payments', limit: '€5,000' },
                        ]
                    }
                ]
            });
        }, SIMULATED_DELAY);
    });
};

export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_ANALYTICS_DATA), SIMULATED_DELAY));
};

export const fetchUsers = async (): Promise<User[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_USERS), SIMULATED_DELAY));
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_AUDIT_LOGS), SIMULATED_DELAY));
};

export const fetchUserActivity = async (userId: string): Promise<UserActivityEvent[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const userActivity = MOCK_USER_ACTIVITY.filter(event => event.userId === userId);
            resolve(userActivity);
        }, SIMULATED_DELAY);
    });
};

export const fetchExecutiveData = async (): Promise<ExecutiveData> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_EXECUTIVE_DATA), SIMULATED_DELAY));
}

export const fetchNewsArticles = async (): Promise<NewsArticle[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_NEWS_ARTICLES), SIMULATED_DELAY));
};

export const fetchTestimonials = async (): Promise<Testimonial[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_TESTIMONIALS), SIMULATED_DELAY));
};

export const fetchAutomationRules = async (): Promise<AutomationRule[]> => {
    const ruleFiles = ['lead_assignment.json', 'payment.json', 'renewal.json', 'task_creation.json'];
    try {
        const responses = await Promise.all(
            ruleFiles.map(file => fetch(`/data/rules/${file}`))
        );

        for (const response of responses) {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${response.url}`);
            }
        }
        
        const allRulesArrays = await Promise.all(responses.map(res => res.json()));
        
        return allRulesArrays.flat();

    } catch (error) {
        console.error("Error fetching automation rules:", error);
        return [];
    }
};