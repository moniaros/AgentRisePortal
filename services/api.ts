import { MOCK_CUSTOMERS, MOCK_LEADS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_ANALYTICS_DATA, MOCK_EXECUTIVE_DATA, MOCK_NEWS_ARTICLES, MOCK_TESTIMONIALS, MOCK_USER_ACTIVITY, MOCK_KPI_DATA } from '../data/mockData';
import { DetailedPolicy, AnalyticsData, User, AuditLog, ExecutiveData, NewsArticle, Testimonial, UserActivityEvent } from '../types';

const SIMULATED_DELAY = 500;

export const fetchDashboardData = async () => {
    return new Promise<{
        newLeadsCount: number;
        monthlyRevenue: number;
        policyDistribution: { name: string; value: number }[];
        totalPoliciesInForce: { current: number; previous: number; };
        newLeadsThisMonth: { current: number; previous: number; };
        dailyLeadTrend: { date: string; count: number; }[];
        totalPremiumsWritten: { current: number; previous: number; };
        onTimeRenewalRate: number;
    }>(resolve => {
        setTimeout(() => {
            // FIX: Explicitly type the accumulator for the reduce function to ensure correct type inference.
            const policyDist = MOCK_CUSTOMERS.flatMap(c => c.policies).reduce<Record<string, number>>((acc, policy) => {
                acc[policy.type] = (acc[policy.type] || 0) + 1;
                return acc;
            }, {});

            const today = new Date();
            const thisMonth = today.getMonth();
            const thisYear = today.getFullYear();
            const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
            const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
            
            const newLeadsThisMonthCount = MOCK_LEADS.filter(l => {
                const leadDate = new Date(l.createdAt);
                return leadDate.getMonth() === thisMonth && leadDate.getFullYear() === thisYear;
            }).length;

            const newLeadsLastMonthCount = MOCK_LEADS.filter(l => {
                const leadDate = new Date(l.createdAt);
                return leadDate.getMonth() === lastMonth && leadDate.getFullYear() === lastMonthYear;
            }).length;

            const dailyLeadTrend: { date: string; count: number; }[] = [];
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];

                const count = MOCK_LEADS.filter(l => new Date(l.createdAt).toISOString().split('T')[0] === dateStr).length;
                dailyLeadTrend.push({ date: d.toLocaleDateString(undefined, { day: '2-digit' }), count });
            }

            // --- On-Time Renewal Rate Calculation ---
            let totalDueForRenewalThisMonth = 0;
            let alreadyRenewed = 0;

            MOCK_CUSTOMERS.forEach(customer => {
                const policiesDueThisMonth = customer.policies.filter(p => {
                    const endDate = new Date(p.endDate);
                    return endDate.getUTCMonth() === thisMonth && endDate.getUTCFullYear() === thisYear;
                });

                totalDueForRenewalThisMonth += policiesDueThisMonth.length;
                
                policiesDueThisMonth.forEach(expiringPolicy => {
                    const renewalExists = customer.policies.some(p => {
                        if (p.type !== expiringPolicy.type || p.id === expiringPolicy.id) return false;
                        
                        const startDate = new Date(p.startDate);
                        const expiringEndDate = new Date(expiringPolicy.endDate);

                        const oneDayAfter = new Date(expiringEndDate);
                        oneDayAfter.setUTCDate(oneDayAfter.getUTCDate() + 1);

                        return startDate.getTime() === oneDayAfter.getTime();
                    });

                    if (renewalExists) {
                        alreadyRenewed++;
                    }
                });
            });

            const onTimeRenewalRate = totalDueForRenewalThisMonth > 0
                ? (alreadyRenewed / totalDueForRenewalThisMonth) * 100
                : 100; // If nothing is due, the rate is 100%
            
            resolve({
                newLeadsCount: MOCK_LEADS.filter(l => l.status === 'new').length,
                monthlyRevenue: MOCK_CUSTOMERS.flatMap(c => c.policies).reduce((sum, p) => sum + p.premium, 0) / 12,
                policyDistribution: Object.entries(policyDist).map(([name, value]) => ({ name, value })),
                totalPoliciesInForce: MOCK_KPI_DATA.totalPoliciesInForce,
                newLeadsThisMonth: { current: newLeadsThisMonthCount, previous: newLeadsLastMonthCount },
                dailyLeadTrend: dailyLeadTrend,
                totalPremiumsWritten: {
                    current: MOCK_KPI_DATA.totalPremiumsWritten.current,
                    previous: MOCK_KPI_DATA.totalPremiumsWritten.previous
                },
                onTimeRenewalRate: Math.round(onTimeRenewalRate),
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