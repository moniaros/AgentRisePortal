

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
        },
        plan: { tier: 'pro' },
        favoriteTemplateIds: []
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
        },
        plan: { tier: 'enterprise' },
        favoriteTemplateIds: []
    },
];

export const MOCK_LEADS: Lead[] = [
    { id: 'lead_1', agencyId: 'agency_1', firstName: 'Alice', lastName: 'Smith', email: 'alice.s@example.com', source: 'Facebook', status: LeadStatus.NEW, createdAt: '2023-10-26T10:00:00Z', potentialValue: 1200, policyType: PolicyType.AUTO, score: 85 },
    { id: 'lead_2', agencyId: 'agency_1', firstName: 'Bob', lastName: 'Johnson', email: 'b.johnson@example.com', source: 'Website', status: LeadStatus.CONTACTED, createdAt: '2023-10-25T14:30:00Z', potentialValue: 800, policyType: PolicyType.HOME, score: 65 },
];

export const MOCK_CUSTOMERS: Customer[] = [
    {
        id: 'cust_1',
        agencyId: 'agency_1',
        firstName: 'Alexandros',
        lastName: 'Papageorgiou',
        email: 'alex.papageorgiou@example.com',
        phone: '6971112233',
        address: 'Λεωφ. Κηφισίας 123, Αθήνα, 11526',
        dateOfBirth: '1985-05-20',
        policies: [
            {
                id: 'pol1',
                type: PolicyType.AUTO,
                policyNumber: 'CAR-12345',
                premium: 350.50,
                startDate: '2023-01-15',
                endDate: '2024-01-14',
                isActive: true,
                insurer: 'Generali',
                coverages: [
                    { type: 'Bodily Injury', limit: '€1,300,000' },
                    { type: 'Property Damage', limit: '€1,300,000' },
                    { type: 'Legal Protection', limit: 'Basic' }
                ],
                vehicle: { make: 'Fiat', model: '500X', year: 2019, vin: 'ZFA334000...' }
            },
            {
                id: 'pol2',
                type: PolicyType.HOME,
                policyNumber: 'HOME-67890',
                premium: 180.00,
                startDate: '2023-08-01',
                endDate: '2024-07-31',
                isActive: true,
                insurer: 'Interamerican',
                coverages: [
                    { type: 'Fire (Building)', limit: '€150,000' },
                    { type: 'Fire (Contents)', limit: '€30,000' },
                    { type: 'Theft', limit: '€10,000' }
                ],
                // Missing Earthquake coverage deliberately for Gap Analysis
            }
        ],
        timeline: [],
        attentionFlag: 'High churn risk due to recent claim denial',
        consent: {
            gdpr: { isGiven: true, dateGranted: '2024-01-15', channel: 'web_form' },
            marketing: { isGiven: true, dateGranted: '2024-01-15', channel: 'email' }
        }
    },
    {
        id: 'cust_2',
        agencyId: 'agency_1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '555-123-4567',
        address: 'Agia Paraskevi 45, Athens',
        dateOfBirth: '1990-11-12',
        policies: [
            {
                id: 'pol3',
                type: PolicyType.LIFE,
                policyNumber: 'LIFE-ABCDE',
                premium: 1200.00,
                startDate: '2021-06-01',
                endDate: '2041-05-31',
                isActive: true,
                insurer: 'MetLife',
                coverages: [
                    { type: 'Term Life', limit: '€200,000' }
                ]
            },
            {
                id: 'pol4',
                type: PolicyType.HEALTH,
                policyNumber: 'HEALTH-FGHIJ',
                premium: 2500.75,
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                isActive: true,
                insurer: 'NN Hellas',
                coverages: [
                    { type: 'Hospitalization', limit: '100%"' },
                    { type: 'Room & Board', limit: 'A Class' },
                    { type: 'Deductible', limit: '€1,500' }
                ]
            }
        ],
        timeline: [],
        consent: {
            gdpr: { isGiven: true, dateGranted: '2024-02-01', channel: 'in_person' },
            marketing: { isGiven: false, dateGranted: null, channel: null }
        }
    }
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
    // Analysis for Cust 1 (Home/Auto Gap)
    {
        id: 'analysis_mock_1',
        createdAt: new Date().toISOString(),
        fileName: 'Home_Policy_2024.pdf',
        parsedPolicy: {
            policyNumber: 'HOME-67890',
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
    },
    // Analysis for Cust 2 (Health Gap)
    {
        id: 'analysis_mock_2',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        fileName: 'Health_Contract_NN.pdf',
        parsedPolicy: {
            policyNumber: 'HEALTH-FGHIJ',
            insurer: 'NN Hellas',
            policyholder: { name: 'Jane Doe', address: 'Agia Paraskevi 45' },
            effectiveDate: '2023-01-01',
            expirationDate: '2023-12-31',
            insuredItems: [{ id: '1', description: 'Jane Doe (Primary)', coverages: [] }]
        },
        analysisResult: {
            riskScore: 45,
            summary: 'Strong hospitalization coverage, but significant exposure to day-to-day medical costs and diagnostic tests.',
            gaps: [
                {
                    area: 'Diagnostic Tests',
                    current: 'Not Included',
                    recommended: 'Add Diagnostic Pack (unlimited)',
                    reason: 'Routine blood work and checkups are paid out of pocket.',
                    priority: 'Medium',
                    financialImpact: '€600 / year (Avg. costs)',
                    costOfImplementation: '€90 / year',
                    costOfInaction: 'Avoiding preventative checkups due to cost.',
                    salesScript: 'Jane, your current plan covers surgeries perfectly, but you are paying cash for every blood test. For just €90/year, we can cover unlimited diagnostic tests at Bioiatriki/Euromedica.'
                }
            ],
            upsell_opportunities: [
                {
                    product: 'Lower Deductible',
                    recommendation: 'Reduce from €1,500 to €500',
                    benefit: 'Easier access to care for minor surgeries.',
                    priority: 'High',
                    financialImpact: '€1,000 (Reduction in out-of-pocket)',
                    costOfImplementation: '€180 / year',
                    salesScript: 'If you have a small incident costing €2,000, currently you pay €1,500. By lowering the deductible, the company pays €1,500 and you only €500.'
                }
            ],
            cross_sell_opportunities: [
                {
                    product: 'Income Protection',
                    recommendation: 'Disability Rider',
                    benefit: 'Ensures salary continuity if unable to work.',
                    priority: 'High',
                    financialImpact: '€1,500 / month (Salary replacement)',
                    costOfImplementation: '€25 / month',
                    salesScript: 'Since you are a freelancer, if you get sick and cant work for a month, you lose income. This rider guarantees your salary continues.'
                }
            ]
        }
    },
    // Analysis for Cust 1 (Auto Gap)
    {
        id: 'analysis_mock_3_el',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        fileName: 'Auto_Policy_Fiat.pdf',
        parsedPolicy: {
            policyNumber: 'CAR-12345',
            insurer: 'Generali',
            policyholder: { name: 'Αλέξανδρος Παπαγεωργίου', address: 'Λεωφ. Κηφισίας 123' },
            effectiveDate: '2024-01-15',
            expirationDate: '2025-01-14',
            insuredItems: [{ id: '1', description: 'Fiat 500X 2019', coverages: [] }]
        },
        analysisResult: {
            riskScore: 60,
            summary: 'Το συμβόλαιο αυτοκινήτου σας παρέχει τις βασικές καλύψεις, αλλά υπάρχουν κενά στην οδική βοήθεια και τη νομική προστασία που μπορούν να σας κοστίσουν ακριβά.',
            gaps: [
                {
                    area: 'Οδική Βοήθεια',
                    current: 'Δεν περιλαμβάνεται',
                    recommended: 'Πλήρης Οδική Βοήθεια Πανευρωπαϊκά',
                    reason: 'Μια βλάβη ή ατύχημα μακριά από το σπίτι μπορεί να οδηγήσει σε υψηλά κόστη ρυμούλκησης και ταλαιπωρία.',
                    priority: 'High',
                    financialImpact: '€300 (Κόστος ρυμούλκησης)',
                    costOfImplementation: '€25 / έτος',
                    costOfInaction: 'Μεγάλη ταλαιπωρία και απρόβλεπτα έξοδα σε περίπτωση βλάβης.',
                    salesScript: 'Αλέξανδρε, είδα ότι δεν έχεις οδική βοήθεια. Αν μείνεις από λάστιχο στην εθνική, η ρυμούλκηση θα σου κοστίσει τουλάχιστον 150 ευρώ. Με 25 ευρώ το χρόνο, έχεις το κεφάλι σου ήσυχο. Να το προσθέσουμε;'
                }
            ],
            upsell_opportunities: [
                {
                    product: 'Αναβάθμιση Νομικής Προστασίας',
                    recommendation: 'Αύξηση ορίου σε €10,000',
                    benefit: 'Καλύπτει πλήρως τα δικαστικά έξοδα σε περίπτωση σοβαρού ατυχήματος ή διαφωνίας.',
                    priority: 'Medium',
                    financialImpact: '€5,000 (Δικαστικά έξοδα)',
                    costOfImplementation: '€20 / έτος',
                    salesScript: 'Η νομική προστασία που έχεις είναι η βασική. Με μόνο 20 ευρώ επιπλέον, το όριο πηγαίνει στα 10.000€ και καλύπτει και ποινικά δικαστήρια. Είναι μια μικρή επένδυση για τεράστια ασφάλεια.'
                }
            ],
            cross_sell_opportunities: [
                 {
                    product: 'Προσωπικό Ατύχημα Οδηγού',
                    recommendation: 'Προσθήκη κάλυψης προσωπικού ατυχήματος',
                    benefit: 'Παρέχει αποζημίωση σε περίπτωση σωματικής βλάβης του οδηγού, ανεξάρτητα από την υπαιτιότητα.',
                    priority: 'High',
                    financialImpact: '€20,000 (Κεφάλαιο ατυχήματος)',
                    costOfImplementation: '€35 / έτος',
                    salesScript: 'Το πιο σημαντικό σε ένα αυτοκίνητο είναι ο οδηγός. Με 35 ευρώ το χρόνο εξασφαλίζεις ένα κεφάλαιο για τον εαυτό σου σε περίπτωση ατυχήματος. Είναι η πιο έξυπνη κίνηση που μπορείς να κάνεις.'
                }
            ]
        }
    },
    // Analysis for Cust 2 (Life Gap)
    {
        id: 'analysis_mock_4_en',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        fileName: 'MetLife_Term_Life.pdf',
        parsedPolicy: {
            policyNumber: 'LIFE-ABCDE',
            insurer: 'MetLife',
            policyholder: { name: 'Jane Doe', address: 'Agia Paraskevi 45' },
            effectiveDate: '2021-06-01',
            expirationDate: '2041-05-31',
            insuredItems: [{ id: '1', description: 'Jane Doe (Primary)', coverages: [{type: 'Term Life', limit: '€200,000'}] }]
        },
        analysisResult: {
            riskScore: 55,
            summary: 'Your term life policy provides a good foundation, but the coverage amount may be insufficient for long-term income replacement and future inflation.',
            gaps: [
                {
                    area: 'Coverage Amount vs. Inflation',
                    current: '€200,000',
                    recommended: '€350,000 with inflation adjustment rider',
                    reason: 'Over a 20-year term, inflation can erode the real value of the death benefit, leaving your family under-protected.',
                    priority: 'High',
                    financialImpact: '€150,000 (Potential shortfall)',
                    costOfImplementation: '€350 / year (Est. increase)',
                    costOfInaction: 'Family may struggle to cover mortgage and living expenses long-term.',
                    salesScript: 'Jane, when you took out this policy, €200k was a solid number. With recent inflation, that same amount won’t go as far in 10 or 15 years. For a small increase, we can boost the coverage to €350k to ensure your family is truly protected, no matter what.'
                }
            ],
            upsell_opportunities: [],
            cross_sell_opportunities: [
                {
                    product: 'Critical Illness Insurance',
                    recommendation: 'Add a Critical Illness rider or separate policy',
                    benefit: 'Provides a lump sum payment upon diagnosis of a major illness (e.g., cancer, heart attack), which your life insurance does not cover while you are alive.',
                    priority: 'Critical',
                    financialImpact: '€50,000 (Medical & living costs)',
                    costOfImplementation: '€400 / year',
                    salesScript: 'Your life insurance is fantastic for protecting your family if you pass away, but what if you get seriously ill and can\'t work? A Critical Illness plan gives you a lump sum of cash to handle those costs, so you can focus on recovery without financial stress.'
                }
            ]
        }
    },
    // New Greek Analysis for Customer 1 (Alexandros Papageorgiou) - Life/Health Cross-sell
    {
        id: 'analysis_mock_5_el',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        fileName: 'Client_Profile_Review_2024.pdf',
        parsedPolicy: { 
            policyNumber: 'N/A',
            insurer: 'N/A',
            policyholder: { name: 'Αλέξανδρος Παπαγεωργίου', address: 'Λεωφ. Κηφισίας 123' },
            effectiveDate: new Date().toISOString().split('T')[0],
            expirationDate: new Date().toISOString().split('T')[0],
            insuredItems: [{ id: '1', description: 'Existing Portfolio (Auto, Home)', coverages: [] }]
        },
        analysisResult: {
            riskScore: 65,
            summary: 'Το χαρτοφυλάκιο του Αλέξανδρου καλύπτει περιουσία και όχημα, αλλά αφήνει εκτεθειμένο τον σημαντικότερο παράγοντα: το εισόδημά του και την οικογένειά του από απρόοπτα γεγονότα υγείας ή ζωής.',
            gaps: [],
            upsell_opportunities: [],
            cross_sell_opportunities: [
                {
                    product: 'Ασφάλεια Ζωής & Εισοδήματος',
                    recommendation: 'Δημιουργία ενός προγράμματος προστασίας εισοδήματος και κεφαλαίου για την οικογένεια.',
                    benefit: 'Εξασφαλίζει ότι η οικογένειά του θα μπορέσει να διατηρήσει το βιοτικό της επίπεδο και να αποπληρώσει το στεγαστικό δάνειο, ακόμα κι αν ο ίδιος δεν μπορεί να εργαστεί.',
                    priority: 'Critical',
                    financialImpact: '€150,000 (Κεφάλαιο) + €1,500/μήνα (Εισόδημα)',
                    costOfImplementation: '€65 / μήνα',
                    salesScript: 'Αλέξανδρε, έχουμε ασφαλίσει το σπίτι και το αυτοκίνητο, αλλά η "μηχανή" που τα συντηρεί - το εισόδημά σου - είναι απροστάτευτη. Με €65 το μήνα, μπορούμε να εγγυηθούμε ότι η οικογένειά σου θα έχει το εισόδημα που χρειάζεται, ό,τι κι αν συμβεί. Είναι το πιο σημαντικό συμβόλαιο που θα υπογράψεις ποτέ.'
                },
                {
                    product: 'Πρόγραμμα Υγείας',
                    recommendation: 'Κάλυψη νοσοκομειακών εξόδων σε ιδιωτικά θεραπευτήρια.',
                    benefit: 'Άμεση πρόσβαση σε ποιοτικές υπηρεσίες υγείας χωρίς αναμονές και οικονομική επιβάρυνση σε περίπτωση ασθένειας ή ατυχήματος.',
                    priority: 'High',
                    financialImpact: '€30,000+ (Κόστος σοβαρής νοσηλείας)',
                    costOfImplementation: '€80 / μήνα',
                    salesScript: 'Το δημόσιο σύστημα έχει τις αδυναμίες του. Με ένα ιδιωτικό πρόγραμμα υγείας, εξασφαλίζεις για σένα και την οικογένειά σου άμεση και αξιοπρεπή περίθαλψη, χωρίς να ανησυχείς για το κόστος σε μια δύσκολη στιγμή.'
                }
            ]
        }
    },
    // New English Analysis for Customer 2 (Jane Doe) - Auto Gaps
    {
        id: 'analysis_mock_6_en',
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago
        fileName: 'Auto_Quote_Request_2024.pdf',
        parsedPolicy: {
            policyNumber: 'N/A',
            insurer: 'Previous Insurer',
            policyholder: { name: 'Jane Doe', address: 'Agia Paraskevi 45' },
            effectiveDate: new Date().toISOString().split('T')[0],
            expirationDate: new Date().toISOString().split('T')[0],
            insuredItems: [{ id: '1', description: '2022 Toyota Yaris', coverages: [{type: 'Basic Liability', limit: 'State Minimum'}] }]
        },
        analysisResult: {
            riskScore: 80,
            summary: 'Jane\'s current auto coverage is dangerously minimal, exposing her to significant financial risk from at-fault accidents, theft, or natural disasters. Key protections are completely missing.',
            gaps: [
                {
                    area: 'Collision & Comprehensive',
                    current: 'Not Included',
                    recommended: 'Add Collision and Comprehensive coverage with a €500 deductible.',
                    reason: 'Without this, any damage to her own vehicle from an accident, theft, fire, or natural event is entirely her own cost. For a 2022 vehicle, this is a major financial exposure.',
                    priority: 'Critical',
                    financialImpact: '€18,000 (Vehicle Value)',
                    costOfImplementation: '€250 / year',
                    costOfInaction: 'Total loss of vehicle value in an accident.',
                    salesScript: 'Jane, I noticed your current policy only covers damages to others. If anything happens to your Yaris - an accident, a hailstorm, or theft - the repair or replacement cost is entirely on you. We can add full protection for your car for about €20 a month. It\'s critical for a new car like yours.'
                },
                {
                    area: 'Uninsured Motorist Protection',
                    current: 'Not Included',
                    recommended: 'Add Uninsured/Underinsured Motorist Coverage',
                    reason: 'Protects you from financial loss if you are hit by a driver with no insurance or insufficient coverage, a common issue.',
                    priority: 'High',
                    financialImpact: '€50,000+ (Medical Bills & Lost Wages)',
                    costOfImplementation: '€40 / year',
                    costOfInaction: 'Risk of covering your own medical bills after an accident that wasn\'t your fault.',
                    salesScript: 'One of the biggest risks on the road today is being hit by someone without insurance. This small addition ensures your medical costs are covered no matter who is at fault or if they flee the scene.'
                }
            ],
            upsell_opportunities: [
                {
                    product: 'Roadside Assistance',
                    recommendation: 'Add premium roadside assistance package.',
                    benefit: 'Peace of mind knowing help is available 24/7 for a flat tire, dead battery, or towing.',
                    priority: 'Medium',
                    financialImpact: '€150 (Avg. Towing Cost)',
                    costOfImplementation: '€25 / year',
                    salesScript: 'For less than the cost of one tow, you can have 24/7 roadside assistance for the entire year. It\'s a great safety net to have.'
                }
            ],
            cross_sell_opportunities: []
        }
    },
    // New Greek Analysis for Customer 1 (Alexandros Papageorgiou) - Umbrella & Investment
    {
        id: 'analysis_mock_7_el',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
        fileName: 'Ετήσια Ανασκόπηση Χαρτοφυλακίου.pdf',
        parsedPolicy: { 
            policyNumber: 'N/A',
            insurer: 'N/A',
            policyholder: { name: 'Αλέξανδρος Παπαγεωργίου', address: 'Λεωφ. Κηφισίας 123' },
            effectiveDate: new Date().toISOString().split('T')[0],
            expirationDate: new Date().toISOString().split('T')[0],
            insuredItems: [{ id: '1', description: 'Υφιστάμενο Χαρτοφυλάκιο (Αυτοκίνητο, Κατοικία)', coverages: [] }]
        },
        analysisResult: {
            riskScore: 70,
            summary: 'Ενώ τα βασικά περιουσιακά σας στοιχεία είναι καλυμμένα, η οικονομική σταθερότητα της οικογένειάς σας είναι εκτεθειμένη σε σημαντικούς κινδύνους αστικής ευθύνης και στερείται μιας μακροπρόθεσμης στρατηγικής προστασίας κεφαλαίου. Εντοπίσαμε ένα κρίσιμο κενό και μια σημαντική ευκαιρία για τη διασφάλιση του μέλλοντός σας.',
            gaps: [
                 {
                    area: 'Αστική Ευθύνη (Umbrella)',
                    current: 'Βασική κάλυψη από συμβόλαια Αυτοκινήτου/Κατοικίας',
                    recommended: 'Προσθήκη Ομπρέλας Αστικής Ευθύνης με όριο €500,000',
                    reason: 'Ένα σοβαρό υπαίτιο ατύχημα ή ένα περιστατικό στην κατοικία σας θα μπορούσε να οδηγήσει σε αγωγή που θα ξεπερνά τα βασικά όρια, θέτοντας σε κίνδυνο την προσωπική σας περιουσία (καταθέσεις, ακίνητα).',
                    priority: 'Critical',
                    financialImpact: '€200,000+ (Πιθανή αποζημίωση πέραν των ορίων)',
                    costOfImplementation: '€180 / έτος',
                    costOfInaction: 'Κίνδυνος κατάσχεσης προσωπικής περιουσίας.',
                    salesScript: 'Αλέξανδρε, τα συμβόλαιά σου σε καλύπτουν για τα βασικά. Αν όμως γίνει ένα σοβαρό ατύχημα και η αποζημίωση ξεπεράσει τα όρια, κινδυνεύει η περιουσία σου. Με λιγότερο από 15€/μήνα, προσθέτουμε μια \'ομπρέλα\' προστασίας μισού εκατομμυρίου. Είναι η πιο έξυπνη κίνηση για την προστασία της οικογένειάς σου.'
                }
            ],
            upsell_opportunities: [],
            cross_sell_opportunities: [
                {
                    product: 'Επενδυτικό Πρόγραμμα Unit-Linked',
                    recommendation: 'Έναρξη αποταμιευτικού προγράμματος συνδεδεμένου με επενδυτικά κεφάλαια για τις σπουδές των παιδιών και τη σύνταξη.',
                    benefit: 'Συνδυάζει ασφάλιση ζωής με δυνατότητα υψηλών αποδόσεων, δημιουργώντας ένα φορολογικά αποδοτικό όχημα συσσώρευσης κεφαλαίου.',
                    priority: 'High',
                    financialImpact: '€250,000 (Εκτιμώμενη μελλοντική αξία)',
                    costOfImplementation: '€150 / μήνα',
                    salesScript: 'Έχουμε ασφαλίσει το \'σήμερα\'. Ήρθε η ώρα να επενδύσουμε στο \'αύριο\'. Με 150€ το μήνα, μπορούμε να δημιουργήσουμε ένα σημαντικό κεφάλαιο για τις σπουδές των παιδιών, αξιοποιώντας την άνοδο των αγορών και παράλληλα έχοντας ασφαλιστική κάλυψη. Ας το δούμε μαζί.'
                }
            ]
        }
    },
    // New English Analysis for Customer 2 (Jane Doe) - Income Protection
    {
        id: 'analysis_mock_8_en',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
        fileName: 'Annual Freelancer Risk Review.pdf',
        parsedPolicy: {
            policyNumber: 'N/A',
            insurer: 'N/A',
            policyholder: { name: 'Jane Doe', address: 'Agia Paraskevi 45' },
            effectiveDate: new Date().toISOString().split('T')[0],
            expirationDate: new Date().toISOString().split('T')[0],
            insuredItems: [{ id: '1', description: 'Existing Portfolio (Life, Health)', coverages: [] }]
        },
        analysisResult: {
            riskScore: 85,
            summary: 'Your portfolio effectively covers end-of-life and major medical events, but critically overlooks the most probable financial risk for a freelancer: loss of income due to temporary disability or serious illness. This gap could derail your financial stability.',
            gaps: [
                {
                    area: 'Income Protection / Disability Insurance',
                    current: 'None',
                    recommended: 'Long-Term Disability Insurance policy covering 60% of income.',
                    reason: 'As a freelancer, any period where you cannot work due to illness or injury means 100% income loss. Your health insurance covers medical bills, but not your mortgage, groceries, or business expenses.',
                    priority: 'Critical',
                    financialImpact: 'Loss of €4,000/month income (Est.)',
                    costOfImplementation: '€95 / month',
                    costOfInaction: 'Depletion of savings, inability to pay bills after 1-2 months of illness.',
                    salesScript: 'Jane, we\'ve protected your family in a worst-case scenario with life insurance. But what protects YOU if you break your leg and can\'t work for 3 months? Your income stops, but the bills don\'t. This policy acts as your own personal sick pay, ensuring your financial life continues uninterrupted while you recover.'
                }
            ],
            upsell_opportunities: [
                {
                    product: 'Critical Illness Rider on Life Policy',
                    recommendation: 'Upgrade your Term Life policy to include a €50,000 lump-sum Critical Illness benefit.',
                    benefit: 'Provides immediate, tax-free cash upon diagnosis of a major illness (cancer, stroke, etc.) to cover non-medical costs, experimental treatments, or simply provide financial breathing room.',
                    priority: 'High',
                    financialImpact: '€50,000 Lump Sum',
                    costOfImplementation: 'Add €25 / month to premium',
                    salesScript: 'Your life policy is great, but it only pays out if you pass away. What if you survive a heart attack? This rider gives you €50,000 cash, no questions asked, the moment you are diagnosed. It\'s a \'living benefit\' that protects you, not just your estate.'
                }
            ],
            cross_sell_opportunities: []
        }
    }
];