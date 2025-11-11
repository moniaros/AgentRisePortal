import { MOCK_CUSTOMERS, MOCK_LEADS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_ANALYTICS_DATA, MOCK_EXECUTIVE_DATA, MOCK_NEWS_ARTICLES, MOCK_TESTIMONIALS, MOCK_USER_ACTIVITY } from '../data/mockData';
import { DetailedPolicy, AnalyticsData, User, AuditLog, ExecutiveData, NewsArticle, Testimonial, UserActivityEvent, AutomationRule, MessageTemplate, TemplateChannel, AutomationEvent, AutomationAnalytics, GbpLocationSummary, GbpReview, TransactionInquiry } from '../types';

const SIMULATED_DELAY = 500;

export const fetchInquiries = async (): Promise<TransactionInquiry[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await fetch('/data/inquiries.json');
            if (!res.ok) throw new Error('Failed to fetch inquiries mock data');
            const data = await res.json();
            setTimeout(() => resolve(data), SIMULATED_DELAY);
        } catch (err) {
            reject(err);
        }
    });
};

export const fetchGbpData = async (locationId: string): Promise<{ summary: GbpLocationSummary; reviews: GbpReview[] }> => {
    // In a real app, we'd use locationId to make actual API calls
    console.log(`Fetching GBP data for ${locationId}`);
    return new Promise(async (resolve, reject) => {
        try {
            const [summaryRes, reviewsRes] = await Promise.all([
                fetch('/data/gbp_location.json'),
                fetch('/data/gbp_reviews.json'),
            ]);
            if (!summaryRes.ok || !reviewsRes.ok) {
                throw new Error('Failed to fetch GBP mock data');
            }
            const summary = await summaryRes.json();
            const reviewsData = await reviewsRes.json();
            
            setTimeout(() => {
                resolve({ summary, reviews: reviewsData.reviews });
            }, SIMULATED_DELAY);

        } catch (err) {
            reject(err);
        }
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
    try {
        const response = await fetch(`/data/rules/automation_rules.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch automation_rules.json`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching automation rules:", error);
        return [];
    }
};

export const fetchTemplates = async (): Promise<MessageTemplate[]> => {
    const templateTypes: TemplateChannel[] = ['email', 'sms', 'viber', 'whatsapp'];
    try {
        const responses = await Promise.all(
            templateTypes.map(type => fetch(`/data/templates/${type}.json`))
        );

        if (responses.some(res => !res.ok)) {
            throw new Error('Failed to fetch one or more template files.');
        }

        const templatesData = await Promise.all(responses.map(res => res.json()));

        const allTemplates: MessageTemplate[] = [];
        templateTypes.forEach((type, index) => {
            const templatesForType = templatesData[index] as Omit<MessageTemplate, 'channel'>[];
            templatesForType.forEach(t => {
                allTemplates.push({ ...t, channel: type });
            });
        });

        return allTemplates;

    } catch (error) {
        console.error("Error fetching message templates:", error);
        return [];
    }
};

export const fetchAutomationEvents = async (): Promise<AutomationEvent[]> => {
    try {
        const response = await fetch(`/data/analytics/automation_events.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch automation_events.json`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching automation events:", error);
        return [];
    }
};

export const fetchAutomationAnalytics = async (): Promise<AutomationAnalytics> => {
    try {
        const response = await fetch(`/data/analytics/automation_summary.json`);
        if (!response.ok) {
            throw new Error(`Failed to fetch automation_summary.json`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching automation analytics:", error);
        return {
            conversionRateBefore: 0,
            conversionRateAfter: 0,
            messagesSentByChannel: [],
        };
    }
};