
import { 
    MOCK_USERS, MOCK_LEADS, MOCK_CUSTOMERS, MOCK_AUDIT_LOGS, 
    MOCK_ANALYTICS_DATA, MOCK_EXECUTIVE_DATA, MOCK_NEWS_ARTICLES, 
    MOCK_TESTIMONIALS, MOCK_USER_ACTIVITY 
} from '../data/mockData';
import { MICROSITE_TEMPLATES } from '../data/micrositeTemplates';
import { 
    GbpLocationSummary, GbpReview, User, AuditLog, AnalyticsData, Campaign, 
    ExecutiveData, NewsArticle, Testimonial, UserActivityEvent, AutomationRule, 
    MessageTemplate, TransactionInquiry, Opportunity__EXT, Interaction, 
    FirstNoticeOfLoss, ServiceRequest, PerfSample, PortalAccount__EXT, 
    KPISnapshot, Lead, Conversion, FunnelRun, DetailedPolicy, 
    AutomationChannelSettings, AutomationEvent, AutomationAnalytics, 
    TransactionQuoteRequest, Prospect, Task, Customer, MicrositeTemplate 
} from '../types';
import { generateId, delay } from './utils';

// --- MOCK BACKEND REPOSITORY ---

class MockRepository<T extends { id: string }> {
    private storageKey: string;
    private initialDataOrUrl: T[] | string;
    private initialized: boolean = false;

    constructor(key: string, initialDataOrUrl: T[] | string) {
        this.storageKey = `agentos_db_${key}`;
        this.initialDataOrUrl = initialDataOrUrl;
    }

    private async loadData(): Promise<T[]> {
        // 1. Try LocalStorage
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error(`Corrupted data for ${this.storageKey}, resetting.`);
                localStorage.removeItem(this.storageKey);
            }
        }

        // 2. If empty, load initial data
        let data: T[] = [];
        if (Array.isArray(this.initialDataOrUrl)) {
            data = JSON.parse(JSON.stringify(this.initialDataOrUrl)); // Deep copy
        } else {
            // It's a URL
            try {
                const response = await fetch(this.initialDataOrUrl);
                if (!response.ok) throw new Error(`Failed to fetch ${this.initialDataOrUrl}`);
                data = await response.json();
            } catch (e) {
                console.error(`Failed to load initial data for ${this.storageKey}`, e);
                data = [];
            }
        }

        // 3. Save to Storage
        this.saveData(data);
        return data;
    }

    private saveData(data: T[]) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    private async ensureInitialized() {
        if (!this.initialized) {
            // Pre-load checking? For now we just rely on getALL to load.
            // Actually, let's just let methods call loadData internally which handles caching.
        }
    }

    // --- CRUD Operations ---

    async getAll(): Promise<T[]> {
        await delay();
        return this.loadData();
    }

    async getById(id: string): Promise<T | undefined> {
        await delay();
        const all = await this.loadData();
        return all.find(item => item.id === id);
    }

    async create(item: Omit<T, 'id'> & { id?: string }): Promise<T> {
        await delay();
        const all = await this.loadData();
        const newItem = { ...item, id: item.id || generateId() } as T;
        all.push(newItem);
        this.saveData(all);
        return newItem;
    }

    async update(id: string, updates: Partial<T>): Promise<T> {
        await delay();
        const all = await this.loadData();
        const index = all.findIndex(item => item.id === id);
        if (index === -1) throw new Error(`Item with id ${id} not found`);
        
        const updatedItem = { ...all[index], ...updates };
        all[index] = updatedItem;
        this.saveData(all);
        return updatedItem;
    }

    async delete(id: string): Promise<void> {
        await delay();
        const all = await this.loadData();
        const filtered = all.filter(item => item.id !== id);
        this.saveData(filtered);
    }
    
    // Helper for query filtering (backend simulation)
    async find(predicate: (item: T) => boolean): Promise<T[]> {
        await delay();
        const all = await this.loadData();
        return all.filter(predicate);
    }
}

// --- SERVICE INSTANCES ---

export const userService = new MockRepository<User>('users', MOCK_USERS);
export const leadService = new MockRepository<Lead>('leads', '/data/allLeads.json'); // Using the larger dataset
export const customerService = new MockRepository<Customer>('customers', MOCK_CUSTOMERS);
export const auditLogService = new MockRepository<AuditLog>('audit_logs', MOCK_AUDIT_LOGS);
export const analyticsService = new MockRepository<any>('analytics', MOCK_ANALYTICS_DATA); // Using any for simpler transition if type mismatches
export const campaignService = new MockRepository<Campaign>('campaigns', [
    // Mock campaigns directly here as they were in the hook previously
    {
        id: 'camp_1',
        name: 'Summer Auto Insurance Promo',
        objective: 'lead_conversion' as any,
        network: 'facebook',
        language: 'en' as any,
        audience: { ageRange: [25, 55], interests: ['cars', 'driving'] },
        budget: 500,
        startDate: '2024-07-01',
        endDate: '2024-07-31',
        creative: { headline: 'Save Big on Car Insurance This Summer!', body: 'Get a free quote today and see how much you can save.', image: 'https://via.placeholder.com/1200x628.png?text=Summer+Car+Insurance' },
        status: 'active',
        agencyId: 'agency_1',
    },
    {
        id: 'camp_2',
        name: 'Προσφορά Ασφάλειας Κατοικίας',
        objective: 'brand_awareness' as any,
        network: 'instagram',
        language: 'el' as any,
        audience: { ageRange: [30, 65], interests: ['home improvement', 'real estate'] },
        budget: 750,
        startDate: '2024-08-01',
        endDate: '2024-08-31',
        creative: { headline: 'Προστατέψτε το Σπίτι σας!', body: 'Ασφάλεια κατοικίας με κορυφαίες καλύψεις. Ζητήστε προσφορά.', image: 'https://via.placeholder.com/1080x1080.png?text=Home+Insurance' },
        status: 'active',
        agencyId: 'agency_1',
    },
    {
        id: 'camp_3',
        name: 'Beta Brokers Brand Campaign',
        objective: 'brand_awareness' as any,
        network: 'linkedin',
        language: 'en' as any,
        audience: { ageRange: [35, 60], interests: ['business', 'finance'] },
        budget: 1200,
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        creative: { headline: 'Professional Insurance Solutions', body: 'Trust Beta Brokers for all your commercial insurance needs.', image: '' },
        status: 'draft',
        agencyId: 'agency_2'
    }
]);
export const newsService = new MockRepository<NewsArticle>('news', MOCK_NEWS_ARTICLES);
export const testimonialService = new MockRepository<Testimonial>('testimonials', MOCK_TESTIMONIALS);
export const automationRuleService = new MockRepository<AutomationRule>('automation_rules', '/data/rules/automation_rules.json');
export const automationEventService = new MockRepository<AutomationEvent>('automation_events', '/data/analytics/automation_events.json');
export const templateService = new MockRepository<MessageTemplate>('templates', [
    { id: 'tmpl_1', name: 'Welcome Email', channel: 'email', content: 'Welcome to our agency, {{Lead.FirstName}}! We are excited to help you.' },
    { id: 'tmpl_2', name: 'Policy Renewal Reminder', channel: 'email', content: 'Dear {{Lead.FirstName}}, your policy is due for renewal soon.' },
    { id: 'tmpl_3', name: 'Meeting Reminder', channel: 'sms', content: 'Hi {{Lead.FirstName}}, just a reminder about our meeting tomorrow.' },
    { id: 'tmpl_4', name: 'Special Offer', channel: 'viber', content: 'Check out our exclusive offer for you, {{Lead.FirstName}}!' },
    { id: 'tmpl_5', name: 'Document Request', channel: 'whatsapp', content: 'Hello {{Lead.FirstName}}, could you please send over the requested documents?' }
]);
export const micrositeTemplateService = new MockRepository<MicrositeTemplate>('microsite_templates', MICROSITE_TEMPLATES);

// Pipeline Services
export const inquiryService = new MockRepository<TransactionInquiry>('inquiries', '/data/transaction_inquiries.json');
export const opportunityService = new MockRepository<Opportunity__EXT>('opportunities', '/data/opportunities_ext.json');
export const prospectService = new MockRepository<Prospect>('prospects', '/data/prospects.json');
export const interactionService = new MockRepository<Interaction>('interactions', '/data/interactions.json');
export const taskService = new MockRepository<Task>('tasks', '/data/tasks.json');
export const conversionService = new MockRepository<Conversion>('conversions', '/data/allConversions.json');
export const quoteRequestService = new MockRepository<TransactionQuoteRequest>('quote_requests', '/data/transaction_quoterequests.json');

// Executive / Dashboard Data 
// (Some of these are read-only aggregates in a real app, but we treat them as repositories for the mock)
export const kpiService = new MockRepository<KPISnapshot>('kpi_snapshots', '/data/allKpiSnapshots.json');
export const performanceService = new MockRepository<PerfSample>('performance', '/data/allPerformanceSamples.json');
export const funnelService = new MockRepository<FunnelRun>('funnel_runs', '/data/allFunnelRuns.json');
export const ftnolService = new MockRepository<FirstNoticeOfLoss>('ftnol', '/data/firstNoticeOfLoss.json');
export const serviceRequestService = new MockRepository<ServiceRequest>('service_requests', '/data/serviceRequests.json');
export const portalAccountService = new MockRepository<PortalAccount__EXT>('portal_accounts', '/data/portalAccounts.json');


// --- LEGACY API FUNCTIONS (Wrappers) ---
// These allow the existing application to function while we migrate to using the services directly.

export const fetchUsers = () => userService.getAll();
export const fetchAuditLogs = () => auditLogService.getAll();
export const fetchAnalyticsData = () => analyticsService.getAll();
export const fetchNewsArticles = () => newsService.getAll();
export const fetchTestimonials = () => testimonialService.getAll();
export const fetchAutomationRules = () => automationRuleService.getAll();
export const fetchAutomationEvents = () => automationEventService.getAll();
export const fetchTemplates = () => templateService.getAll();
export const fetchMicrositeTemplates = () => micrositeTemplateService.getAll();
export const fetchMicrositeTemplateById = (id: string) => micrositeTemplateService.getById(id);

export const fetchTransactionInquiries = () => inquiryService.getAll();
export const fetchTransactionQuoteRequests = () => quoteRequestService.getAll();
export const fetchOpportunitiesExt = () => opportunityService.getAll();
export const fetchProspects = () => prospectService.getAll();
export const fetchPipelineInteractions = () => interactionService.getAll();
export const fetchPipelineConversions = () => conversionService.getAll();
export const fetchTasks = () => taskService.getAll();

export const fetchFirstNoticeOfLoss = () => ftnolService.getAll();
export const fetchServiceRequests = () => serviceRequestService.getAll();
export const fetchPerformanceSamples = () => performanceService.getAll();
export const fetchPortalAccounts = () => portalAccountService.getAll();

export const fetchKpiSnapshots = () => kpiService.getAll();
export const fetchAllLeads = () => leadService.getAll();
export const fetchAllKpiSnapshots = () => kpiService.getAll();
export const fetchAllPerformanceSamples = () => performanceService.getAll();
export const fetchAllFunnelRuns = () => funnelService.getAll();
export const fetchAllOpportunities = () => opportunityService.getAll();
export const fetchAllConversions = () => conversionService.getAll();

export const fetchUserActivity = async (userId: string): Promise<UserActivityEvent[]> => {
    await delay();
    return MOCK_USER_ACTIVITY.filter(act => act.userId === userId);
};

// These use constants directly for now as they are single objects or complex aggregates
export const fetchExecutiveData = async (): Promise<ExecutiveData> => {
    await delay();
    return MOCK_EXECUTIVE_DATA;
};

export const fetchGbpData = async (locationName: string): Promise<{ summary: GbpLocationSummary, reviews: GbpReview[] }> => {
    // This simulates an external API call that doesn't persist to our "DB" in the same way
    await delay();
    const summary: GbpLocationSummary = {
        title: 'Alpha Omega Insurance',
        averageRating: 4.8,
        totalReviewCount: 134,
    };
    const reviewsJson = await import('../data/gbp_reviews.json');
    return { summary, reviews: reviewsJson.reviews as any };
};

export const fetchParsedPolicy = async (): Promise<DetailedPolicy> => {
    await delay();
    const policy = await import('../data/parsedPolicy.json');
    return policy as unknown as DetailedPolicy;
};

export const fetchAutomationSettings = async (): Promise<AutomationChannelSettings> => {
    // Settings are unique, usually a singleton. We can use local storage directly or a repo.
    await delay();
    const stored = localStorage.getItem('agentos_settings_automation');
    if (stored) return JSON.parse(stored);
    
    const defaults = await import('../data/settings/automation.json');
    return defaults as unknown as AutomationChannelSettings;
};

export const saveAutomationSettings = async (settings: AutomationChannelSettings): Promise<void> => {
    await delay();
    localStorage.setItem('agentos_settings_automation', JSON.stringify(settings));
};

export const fetchAutomationAnalytics = async (): Promise<AutomationAnalytics> => {
    await delay();
    const data = await import('../data/analytics/automation_summary.json');
    return data as unknown as AutomationAnalytics;
};

// Dashboard Dashboard specific subsets (simulated by filtering the main repos)
export const fetchInquiries = () => inquiryService.getAll(); // Already fetched by main repo
export const fetchOpportunities = () => opportunityService.getAll(); // Already fetched by main repo
export const fetchInteractions = () => interactionService.getAll(); // Already fetched by main repo

export const toggleMicrositeTemplateFavorite = async (userId: string, templateId: string): Promise<User | null> => {
    await delay();
    const user = await userService.getById(userId);
    if (!user) return null;

    const favorites = user.favoriteTemplateIds || [];
    const isFavorite = favorites.includes(templateId);
    const newFavorites = isFavorite 
        ? favorites.filter(id => id !== templateId) 
        : [...favorites, templateId];

    const updatedUser = await userService.update(userId, { favoriteTemplateIds: newFavorites });
    return updatedUser;
}
