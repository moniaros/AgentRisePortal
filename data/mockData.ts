import { User, Lead, Customer, AuditLog, AnalyticsData, ExecutiveData, NewsArticle, Testimonial, UserActivityEvent, UserSystemRole, PolicyType, LeadStatus, LicenseStatus, StoredAnalysis } from '../types';

export const MOCK_USERS: User[] = [
    {
        id: 'user_1',
        agencyId: 'agency_1',
        party: {
            partyName: { firstName: 'John', lastName: 'Agent' },
            contactInfo: { email: 'moniaros@gmail.com', workPhone: '555-0101' },
            addressInfo: { fullAddress: 'Main Street Branch' },
            profilePhotoUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            signature: ''
        },
        partyRole: {
            roleType: UserSystemRole.AGENT,
            roleTitle: 'Insurance Agent',
            jobTitle: 'Senior Agent',
            department: 'Personal Lines',
            permissionsScope: 'agency',
            licenses: [
                { type: 'P&C', licenseNumber: 'PC12345', expirationDate: '2025-12-31', status: LicenseStatus.VALID },
            ]
        }
    },
    {
        id: 'user_2',
        agencyId: 'agency_1',
        party: {
            partyName: { firstName: 'Admin', lastName: 'User' },
            contactInfo: { email: 'admin@agency1.com', workPhone: '555-0100' },
            addressInfo: { fullAddress: 'Main Street Branch' },
            profilePhotoUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
            signature: ''
        },
        partyRole: {
            roleType: UserSystemRole.ADMIN,
            roleTitle: 'Administrator',
            jobTitle: 'Agency Manager',
            department: 'Management',
            permissionsScope: 'agency',
            licenses: []
        }
    },
];

export const MOCK_LEADS: Lead[] = [
    { id: 'lead_1', agencyId: 'agency_1', firstName: 'Alice', lastName: 'Smith', email: 'alice.s@example.com', source: 'Facebook', status: LeadStatus.NEW, createdAt: '2023-10-26T10:00:00Z', potentialValue: 1200, policyType: PolicyType.AUTO, score: 85 },
    { id: 'lead_2', agencyId: 'agency_1', firstName: 'Bob', lastName: 'Johnson', email: 'b.johnson@example.com', source: 'Website', status: LeadStatus.CONTACTED, createdAt: '2023-10-25T14:30:00Z', potentialValue: 800, policyType: PolicyType.HOME, score: 65 },
];

export const MOCK_CUSTOMERS: Customer[] = [
    { id: 'cust_1', agencyId: 'agency_1', firstName: 'Charlie', lastName: 'Brown', email: 'charlie.b@example.com', policies: [], timeline: [] },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
    { id: 'log_1', agencyId: 'agency_1', timestamp: '2023-10-26T12:00:00Z', actorName: 'Admin User', action: 'user_invited', targetName: 'new.user@example.com', details: 'Invited with role: agent' },
];

export const MOCK_ANALYTICS_DATA: AnalyticsData = [
    { date: '2023-10-01', campaignId: 'camp_1', impressions: 1000, clicks: 50, conversions: 5, spend: 20 },
    { date: '2023-10-02', campaignId: 'camp_1', impressions: 1200, clicks: 60, conversions: 7, spend: 25 },
];

export const MOCK_EXECUTIVE_DATA: ExecutiveData = {
    agencyGrowth: [
        { month: 'Jan', premium: 45000, policies: 30 },
        { month: 'Feb', premium: 48000, policies: 32 },
    ],
    productMix: [
        { name: PolicyType.AUTO, value: 45 },
        { name: PolicyType.HOME, value: 30 },
        { name: PolicyType.LIFE, value: 25 },
    ],
    claimsTrend: [
        { month: 'Jan', submitted: 10, approved: 8, paid: 7 },
        { month: 'Feb', submitted: 12, approved: 9, paid: 9 },
    ],
    leadFunnel: [
        { status: LeadStatus.NEW, count: 100 },
        { status: LeadStatus.CONTACTED, count: 80 },
        { status: LeadStatus.QUALIFIED, count: 50 },
        { status: LeadStatus.CLOSED, count: 20 },
    ],
    campaignRoi: [
        { id: 'camp_1', name: 'Summer Auto Promo', spend: 500, revenue: 2500 },
        { id: 'camp_2', name: 'Home Security Campaign', spend: 800, revenue: 3000 },
    ],
    riskExposure: [
        { area: 'Coastal Properties', exposure: 5000000, mitigation: 2000000 },
        { area: 'High-Risk Auto', exposure: 3000000, mitigation: 2500000 },
    ]
};

export const MOCK_NEWS_ARTICLES: NewsArticle[] = [
    { id: 'news_1', agencyId: 'global', title: 'Understanding Your Auto Policy', summary: 'A deep dive into the components of a standard auto insurance policy.', content: '<p>Full content here.</p>', imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932', publishedDate: '2023-10-20T00:00:00Z', author: { name: 'Insurance Today', avatarUrl: '' }, tags: ['auto', 'education'], seo: {title: 'Understanding Your Auto Policy', description: 'Learn about auto insurance policies.'} },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
    { id: 'test_1', agencyId: 'agency_1', authorName: 'Satisfied Client', quote: 'Great service!', rating: 5, status: 'approved', createdAt: '2023-10-15T00:00:00Z', authorPhotoUrl: '' },
];

export const MOCK_USER_ACTIVITY: UserActivityEvent[] = [
    { id: 'act_1', userId: 'user_1', timestamp: new Date().toISOString(), type: 'login', description: 'Logged in successfully' },
];

export const MOCK_ANALYSES: StoredAnalysis[] = [
    {
        id: 'analysis_mock_1',
        createdAt: new Date().toISOString(),
        fileName: 'Home_Policy_2024.pdf',
        parsedPolicy: {
            policyNumber: 'HOME-12345',
            insurer: 'Interamerican',
            policyholder: { name: 'Αλέξανδρος Παπαγεωργίου', address: 'Λεωφ. Κηφισίας 123' },
            effectiveDate: '2024-01-01',
            expirationDate: '2025-01-01',
            insuredItems: [{ id: '1', description: 'Apartment 120sqm', coverages: [] }]
        },
        analysisResult: {
            riskScore: 75,
            summary: 'Το ασφαλιστήριο κατοικίας σας έχει σημαντικά κενά. Λείπει η κάλυψη σεισμού, εκθέτοντας την περιουσία σας σε σοβαρό κίνδυνο δεδομένης της περιοχής.',
            gaps: [
                {
                    area: 'Κάλυψη Σεισμού',
                    current: 'Δεν περιλαμβάνεται',
                    recommended: 'Πλήρης κάλυψη (Κτίριο & Περιεχόμενο)',
                    reason: 'Η Αττική είναι σεισμογενής ζώνη. Η έλλειψη κάλυψης μπορεί να αποβεί καταστροφική.',
                    priority: 'Critical',
                    financialImpact: '€120,000 (Κόστος Ανακατασκευής)',
                    costOfImplementation: '€150 / έτος',
                    costOfInaction: 'Κίνδυνος ολικής απώλειας περιουσίας.',
                    salesScript: 'Αλέξανδρε, παρατήρησα ότι το συμβόλαιό σου δεν καλύπτει σεισμό. Με δεδομένο ότι μένεις στο Μαρούσι, μια ζημιά €120.000 θα έπρεπε να καλυφθεί από την τσέπη σου. Μπορούμε να το προσθέσουμε με μόλις €12 το μήνα. Να το προχωρήσω;'
                },
                {
                    area: 'Νομική Προστασία',
                    current: 'Βασική',
                    recommended: 'Πλήρης Νομική Προστασία',
                    reason: 'Σε περίπτωση διαφορών με γείτονες ή τρίτους, τα δικαστικά έξοδα είναι υψηλά.',
                    priority: 'Medium',
                    financialImpact: '€3,000 (Δικαστικά έξοδα)',
                    costOfImplementation: '€30 / έτος',
                    costOfInaction: 'Κόστος δικηγόρων εξ ιδίων πόρων.',
                    salesScript: 'Επίσης, είδα ότι η νομική προστασία είναι βασική. Με €30 το χρόνο, εξασφαλίζεις ότι δεν θα πληρώσεις δικηγόρο για διαφορές με γείτονες. Είναι μια έξυπνη προσθήκη.'
                }
            ],
            upsell_opportunities: [
                {
                    product: 'Θραύση Κρυστάλλων',
                    recommendation: 'Προσθήκη κάλυψης',
                    benefit: 'Άμεση αντικατάσταση χωρίς εκταμίευση.',
                    priority: 'High',
                    financialImpact: '€500 (Κόστος τζαμιών)',
                    costOfImplementation: '€15 / έτος',
                    salesScript: 'Για τα τζάμια του σπιτιού, με €15 το χρόνο καλύπτεις ζημιές έως €1000. Αξίζει για την ηρεμία σου.'
                }
            ],
            cross_sell_opportunities: [
                {
                    product: 'Ασφάλεια Ζωής',
                    recommendation: 'Ισόβια ή Πρόσκαιρη',
                    benefit: 'Προστασία οικογένειας & αποπληρωμή δανείων.',
                    priority: 'High',
                    financialImpact: '€100,000 (Κεφάλαιο)',
                    costOfImplementation: '€450 / έτος',
                    salesScript: 'Αλέξανδρε, καθώς έχεις οικογένεια, έχεις σκεφτεί τι θα γίνει με το δάνειο του σπιτιού αν συμβεί κάτι απρόοπτο; Μια ασφάλεια ζωής μπορεί να εξοφλήσει το δάνειο άμεσα.'
                }
            ]
        }
    }
];
