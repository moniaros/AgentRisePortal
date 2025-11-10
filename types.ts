export enum Language {
    EN = 'en',
    EL = 'el',
}

export type TranslationTokens = {
    [key: string]: string | TranslationTokens;
};

export interface SocialPlatform {
    key: string;
    name: string;
    icon: React.ReactElement;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    agencyId: string;
}

export enum UserRole {
    ADMIN = 'admin',
    AGENT = 'agent',
}

export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    source: string;
    status: LeadStatus;
    potentialValue: number;
    createdAt: string;
    customerId?: string;
    campaignId?: string;
    policyType: PolicyType;
    agencyId: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    policies: Policy[];
    timeline: TimelineEvent[];
    attentionFlag?: string;
    communicationPreferences: ('email' | 'sms')[];
    agencyId: string;
}

export interface Policy {
    id: string;
    type: PolicyType;
    policyNumber: string;
    premium: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    insurer: string;
    coverages: Coverage[];
}

export enum PolicyType {
    AUTO = 'auto',
    HOME = 'home',
    LIFE = 'life',
    HEALTH = 'health',
    BUSINESS = 'business',
}

export interface Coverage {
    type: string;
    limit: string;
    deductible?: string;
}

export interface TimelineEvent {
    id: string;
    date: string;
    type: 'note' | 'call' | 'email' | 'meeting' | 'policy_update' | 'claim' | 'system';
    content: string;
    author: string;
    isFlagged?: boolean;
    attachments?: Attachment[];
    annotations?: Annotation[];
}

export interface Annotation {
    id: string;
    date: string;
    author: string;
    content: string;
}

export interface Attachment {
    name: string;
    url: string;
    size: number;
}


// Gap Analysis Types
export interface DetailedPolicy {
    policyNumber: string;
    insurer: string;
    policyholder: {
        name: string;
        address: string;
    };
    insuredItems: {
        id: string;
        description: string;
        coverages: {
            type: string;
            limit: string;
            deductible?: string;
        }[];
    }[];
}

export interface GapAnalysisResult {
    gaps: { area: string; current: string; recommended: string; reason: string }[];
    upsell_opportunities: { product: string; recommendation: string; benefit: string }[];
    cross_sell_opportunities: { product: string; recommendation: string; benefit: string }[];
}

// Onboarding
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}

// Microsite Builder
export type MicrositeBlockType = 'hero' | 'products' | 'testimonials' | 'faq' | 'contact';

export interface BaseBlock {
    id: string;
    type: MicrositeBlockType;
}

export interface HeroBlock extends BaseBlock {
    type: 'hero';
    title: string;
    subtitle: string;
    ctaText: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
}

export interface ProductsBlock extends BaseBlock {
    type: 'products';
    title: string;
    products: Product[];
}

export interface Testimonial {
    id: string;
    quote: string;
    author: string;
}

export interface TestimonialsBlock extends BaseBlock {
    type: 'testimonials';
    title: string;
    testimonials: Testimonial[];
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface FaqBlock extends BaseBlock {
    type: 'faq';
    title: string;
    items: FaqItem[];
}

export interface ContactBlock extends BaseBlock {
    type: 'contact';
    title: string;
    subtitle: string;
}

export type MicrositeBlock = HeroBlock | ProductsBlock | TestimonialsBlock | FaqBlock | ContactBlock;

export interface MicrositeSettings {
    themeColor: string;
    font: string;
    companyName: string;
}

// Campaigns & Analytics
export interface Campaign {
    id: string;
    name: string;
    objective: CampaignObjective;
    network: 'facebook' | 'instagram' | 'linkedin' | 'x';
    language: Language;
    audience: {
        ageRange: [number, number];
        interests: string[];
    };
    budget: number;
    startDate: string;
    endDate: string;
    creative: {
        headline: string;
        body: string;
        image: string;
    };
    status: 'active' | 'draft' | 'completed';
    leadCaptureForm?: {
        fields: LeadCaptureFormField[];
    };
    agencyId: string;
}

export interface LeadCaptureFormField {
    name: string;
    type: 'text' | 'email' | 'tel' | 'number';
    required: boolean;
}

export enum CampaignObjective {
    LEAD_GENERATION = 'LEAD_GENERATION',
    BRAND_AWARENESS = 'BRAND_AWARENESS',
    WEBSITE_TRAFFIC = 'WEBSITE_TRAFFIC',
}

export interface AnalyticsRecord {
    date: string; // YYYY-MM-DD
    campaignId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}
export type AnalyticsData = AnalyticsRecord[];


// User Management
export interface AuditLog {
    id: string;
    timestamp: string;
    actorName: string;
    action: 'user_invited' | 'user_removed' | 'role_changed';
    targetName: string;
    details: string;
    agencyId: string;
}

// Executive Dashboard
export interface ExecutiveData {
    agencyGrowth: { month: string; premium: number; policies: number }[];
    productMix: { name: PolicyType; value: number }[];
    claimsTrend: { month: string; submitted: number; approved: number; paid: number }[];
    leadFunnel: { status: LeadStatus; count: number }[];
    campaignRoi: { id: string; name: string; spend: number; revenue: number; }[];
    riskExposure: { area: string; exposure: number; mitigation: number }[];
}
