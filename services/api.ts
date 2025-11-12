// This file mocks API calls to fetch data.
// In a real application, these would be `fetch` calls to a backend.
import { MOCK_USERS, MOCK_LEADS, MOCK_CUSTOMERS, MOCK_AUDIT_LOGS, MOCK_ANALYTICS_DATA, MOCK_EXECUTIVE_DATA, MOCK_NEWS_ARTICLES, MOCK_TESTIMONIALS, MOCK_USER_ACTIVITY } from '../data/mockData';
import { GbpLocationSummary, GbpReview, User, AuditLog, AnalyticsData, Campaign, ExecutiveData, NewsArticle, Testimonial, UserActivityEvent, AutomationRule, MessageTemplate, TransactionInquiry, Opportunity__EXT, Interaction, FirstNoticeOfLoss, ServiceRequest, PerfSample, PortalAccount__EXT, KPISnapshot, Lead, Conversion, FunnelRun, DetailedPolicy, AutomationChannelSettings, AutomationEvent, AutomationAnalytics, TransactionQuoteRequest, Prospect } from '../types';

const simulateDelay = <T,>(data: T, delay: number = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));
};

// Generic fetcher for new JSON files
const fetchJsonData = async <T,>(path: string): Promise<T> => {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${path}`);
    }
    return response.json();
};


export const fetchGbpData = async (locationName: string): Promise<{ summary: GbpLocationSummary, reviews: GbpReview[] }> => {
    const summary: GbpLocationSummary = {
        title: 'Alpha Omega Insurance',
        averageRating: 4.8,
        totalReviewCount: 134,
    };
    const reviews: GbpReview[] = [
        { name: 'reviews/1', reviewer: { displayName: 'John S.' }, starRating: 'FIVE', comment: 'Great service, very professional.', createTime: '2023-10-26T10:00:00Z', updateTime: '2023-10-26T10:00:00Z' },
        { name: 'reviews/2', reviewer: { displayName: 'Maria P.' }, starRating: 'FOUR', comment: 'Helpful staff, but the process was a bit slow.', createTime: '2023-10-25T14:30:00Z', updateTime: '2023-10-25T14:30:00Z' }
    ];
    return simulateDelay({ summary, reviews });
};

export const fetchUsers = (): Promise<User[]> => simulateDelay(MOCK_USERS);
export const fetchAuditLogs = (): Promise<AuditLog[]> => simulateDelay(MOCK_AUDIT_LOGS);
export const fetchAnalyticsData = (): Promise<AnalyticsData> => simulateDelay(MOCK_ANALYTICS_DATA);
export const fetchExecutiveData = (): Promise<ExecutiveData> => simulateDelay(MOCK_EXECUTIVE_DATA);
export const fetchNewsArticles = (): Promise<NewsArticle[]> => simulateDelay(MOCK_NEWS_ARTICLES);
export const fetchTestimonials = (): Promise<Testimonial[]> => simulateDelay(MOCK_TESTIMONIALS);
export const fetchUserActivity = (userId: string): Promise<UserActivityEvent[]> => {
    const activity = MOCK_USER_ACTIVITY.filter(act => act.userId === userId);
    return simulateDelay(activity);
};

export const fetchAutomationRules = (): Promise<AutomationRule[]> => {
    // Mock data, in a real app would come from a DB
    const rules: AutomationRule[] = [
        { id: '1', agencyId: 'agency_1', name: 'Follow up on New Auto Leads', description: 'Sends a welcome email to new leads interested in auto insurance.', category: 'lead_conversion', triggerType: 'on_lead_creation', conditions: [{ id: 'c1', field: 'policy_interest', operator: 'is', value: 'auto' }], actions: [{id: 'a1', type: 'send_email', templateId: 'email_1'}], isEnabled: true, lastExecuted: '2023-10-26T11:00:00Z', successRate: 0.98 },
        { id: '2', agencyId: 'agency_1', name: 'Nurture High-Score Leads', description: 'Sends an SMS to leads with a score over 90.', category: 'communication_automation', triggerType: 'on_lead_creation', conditions: [{id: 'c2', field: 'lead_score', operator: 'greater_than', value: 90}], actions: [{id: 'a2', type: 'send_sms', templateId: 'sms_1'}], isEnabled: false, lastExecuted: '2023-10-25T09:00:00Z', successRate: 1.0 },
    ];
    return simulateDelay(rules);
};

export const fetchTemplates = (): Promise<MessageTemplate[]> => {
    const templates: MessageTemplate[] = [
        { id: 'email_1', name: 'Welcome Email - Auto', channel: 'email', content: 'Hi {{Lead.FirstName}},\n\nThanks for your interest in our auto insurance! Our agent, {{Agent.FirstName}}, will be in touch shortly.\n\nBest,\nThe Team' },
        { id: 'sms_1', name: 'High-Score Lead SMS', channel: 'sms', content: 'Hi {{Lead.FirstName}}! This is {{Agent.FirstName}}. I saw you were interested in our policies and wanted to reach out.' },
    ];
    return simulateDelay(templates);
};


// Dashboard data
// FIX: Update mock data to match the full TransactionInquiry type.
export const fetchInquiries = (): Promise<TransactionInquiry[]> => simulateDelay([
    {
      id: 'inq_dash_1',
      agencyId: 'agency_1',
      createdAt: new Date().toISOString(),
      contact: {
        firstName: 'Dashboard',
        lastName: 'Inquiry',
        email: 'dash.inquiry@example.com',
        phone: '555-1111',
      },
      consentGDPR: true,
      source: 'Dashboard Widget',
      purpose: 'general',
      attribution: {},
      attributionId: 'attr_dash_1'
    }
]);
// FIX: Update mock data to match the full Opportunity__EXT type.
export const fetchOpportunities = (): Promise<Opportunity__EXT[]> => simulateDelay([
    {
        id: 'opp_dash_1',
        title: 'Overdue Follow Up',
        value: 1200,
        prospectId: 'prospect_dash_1',
        stage: 'contacted',
        nextFollowUpDate: new Date(Date.now() - 86400000).toISOString(),
        agentId: 'user_1',
        agencyId: 'agency_1',
        inquiryId: 'inq_dash_1',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    }
]);
// FIX: Update mock data to match the full Interaction type.
export const fetchInteractions = (): Promise<Interaction[]> => simulateDelay([
    {
        id: 'int_dash_1',
        opportunityId: 'opp_dash_1',
        agentId: 'user_1',
        agencyId: 'agency_1',
        channel: 'email',
        direction: 'inbound',
        content: 'Unread email from prospect.',
        createdAt: new Date().toISOString(),
        // FIX: Add 'read' property to align with the updated Interaction type and dashboard logic.
        read: false,
    }
]);
export const fetchFirstNoticeOfLoss = (): Promise<FirstNoticeOfLoss[]> => simulateDelay([{ id: '1', agencyId: 'agency_1', createdAt: new Date().toISOString() }]);
export const fetchServiceRequests = (): Promise<ServiceRequest[]> => simulateDelay([]);
export const fetchPerformanceSamples = (): Promise<PerfSample[]> => simulateDelay([{ date: new Date().toISOString(), agencyId: 'agency_1', spend: 60, conversions: { lead: 1 } }]);
export const fetchPortalAccounts = (): Promise<PortalAccount__EXT[]> => simulateDelay([{ id: '1', agencyId: 'agency_1', lastLoginAt: new Date().toISOString() }]);

// Executive Dashboard Data
export const fetchKpiSnapshots = (): Promise<KPISnapshot[]> => simulateDelay([]);
export const fetchAllLeads = (): Promise<Lead[]> => simulateDelay(MOCK_LEADS);
export const fetchAllKpiSnapshots = (): Promise<KPISnapshot[]> => simulateDelay([{ date: new Date().toISOString(), agencyId: 'agency_1', source: 'Platform Marketing Leads', won: { count: 1, gwp: 1500 }, avgTimeToFirstReplyH: 2.5 }]);
export const fetchAllPerformanceSamples = (): Promise<PerfSample[]> => simulateDelay([{ date: new Date().toISOString(), agencyId: 'agency_1', spend: 60, conversions: { lead: 1 } }]);
export const fetchAllFunnelRuns = (): Promise<FunnelRun[]> => simulateDelay([{ date: new Date().toISOString(), pageviews: 100, leads: 5 }]);
// FIX: Update mock data to match the full Opportunity__EXT type.
export const fetchAllOpportunities = (): Promise<Opportunity__EXT[]> => simulateDelay([
    {
        id: 'opp_all_1',
        agencyId: 'agency_1',
        title: 'Exec Dash - Follow Up',
        value: 1200,
        prospectId: 'prospect_all_1',
        stage: 'contacted',
        nextFollowUpDate: new Date(Date.now() - 86400000).toISOString(),
        agentId: 'user_1',
        inquiryId: 'inq_all_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
]);
export const fetchAllConversions = (): Promise<Conversion[]> => simulateDelay([{ date: new Date().toISOString(), kind: 'lead', utm_source: 'email', utm_campaign: 'cross-sell-2024' }]);

// Gap analysis mock
export const fetchParsedPolicy = (): Promise<DetailedPolicy> => simulateDelay({
    policyNumber: '63708952',
    insurer: 'ΕΘΝΙΚΗ Η ΠΡΩΤΗ ΑΣΦΑΛΙΣΤΙΚΗ',
    policyholder: { name: 'ΜΟΝΙΑΡΟΣ ΙΩΑΝΝΗΣ', address: 'ΦΟΛΕΓΑΝΔΡΟΥ 11, 16561 ΓΛΥΦΑΔΑ' },
    insuredItems: [{ id: '1', description: 'FIAT 500X (334) CROS', coverages: [{type: 'Σωματικές Βλάβες τρίτων', limit: '1.300.000€'}, {type: 'Υλικές Ζημιές τρίτων', limit: '1.300.000€'}, {type: 'Προσωπικό Ατύχημα Οδηγού', limit: '15.000€'}] }]
});

// Automation Settings
export const fetchAutomationSettings = async (): Promise<AutomationChannelSettings> => {
    // In a real app this would fetch from a database. Here we can use local storage or just mock it.
    const defaultSettings: AutomationChannelSettings = {
        email: { isEnabled: true, host: 'smtp.example.com', port: 587, username: 'user', password: 'password', fromAddress: 'no-reply@example.com' },
        viber: { isEnabled: false },
        whatsapp: { isEnabled: false },
        sms: { isEnabled: false },
    };
    return simulateDelay(defaultSettings);
}

export const fetchAutomationEvents = async (): Promise<AutomationEvent[]> => {
    return simulateDelay([
        { id: 'evt1', agencyId: 'agency_1', timestamp: new Date().toISOString(), ruleId: '1', ruleName: 'Follow up on New Auto Leads', status: 'success', details: 'Email sent to new lead john@doe.com', impact: 'Lead status changed to "contacted"', channel: 'email' }
    ]);
};
export const fetchAutomationAnalytics = async (): Promise<AutomationAnalytics> => {
     return simulateDelay({
        conversionRateBefore: 12.5,
        conversionRateAfter: 18.2,
        messagesSentByChannel: [],
    });
};

// Sales Pipeline Data
export const fetchTransactionInquiries = (): Promise<TransactionInquiry[]> => fetchJsonData('/data/transaction_inquiries.json');
export const fetchTransactionQuoteRequests = (): Promise<TransactionQuoteRequest[]> => fetchJsonData('/data/transaction_quoterequests.json');
export const fetchOpportunitiesExt = (): Promise<Opportunity__EXT[]> => fetchJsonData('/data/opportunities_ext.json');
export const fetchProspects = (): Promise<Prospect[]> => fetchJsonData('/data/prospects.json');
export const fetchPipelineInteractions = (): Promise<Interaction[]> => fetchJsonData('/data/interactions.json');
export const fetchPipelineConversions = (): Promise<Conversion[]> => fetchJsonData('/data/conversions_pipeline.json');
