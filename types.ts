// FIX: Import React to use React.ReactElement type.
import React from 'react';

// Language and Translation
export enum Language {
    EN = 'en',
    EL = 'el',
}

export type TranslationTokens = {
    [key: string]: string | TranslationTokens;
};

// User and Auth
export enum UserSystemRole {
    ADMIN = 'admin',
    AGENT = 'agent',
}

export type LicenseStatus = 'valid' | 'expired' | 'pending_review';

export interface AcordLicense {
    type: string;
    licenseNumber: string;
    expirationDate: string;
    status: LicenseStatus;
}

export interface User {
    id: string;
    agencyId: string;
    party: {
        partyName: {
            firstName: string;
            lastName: string;
        };
        contactInfo: {
            email: string;
            workPhone?: string;
            mobilePhone?: string;
        };
        addressInfo?: {
            fullAddress: string;
        };
        profilePhotoUrl?: string;
        signature?: string;
    };
    partyRole: {
        roleType: UserSystemRole;
        roleTitle: string;
        permissionsScope: 'agency' | 'global';
        jobTitle?: string;
        department?: string;
        licenses?: AcordLicense[];
    };
}

// CRM: Customer, Lead, Policy
export enum PolicyType {
    AUTO = 'auto',
    HOME = 'home',
    LIFE = 'life',
    HEALTH = 'health',
}

export interface Coverage {
    type: string;
    limit: string;
    deductible?: string;
    premium?: number;
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
    beneficiaries?: InsuredPartyACORD[];
    vehicle?: {
        make: string;
        model: string;
        year: number;
        vin: string;
    };
}

export interface Annotation {
    id: string;
    date: string;
    author: string;
    content: string;
}

export interface Attachment {
    name: string;
    size: number;
    url: string;
}


export interface TimelineEvent {
    id: string;
    date: string;
    type: 'note' | 'call' | 'email' | 'meeting' | 'system' | 'policy_update' | 'claim';
    content: string;
    author: string;
    annotations?: Annotation[];
    isFlagged?: boolean;
    attachments?: Attachment[];
}

export interface Customer {
    id: string;
    agencyId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    policies: Policy[];
    timeline: TimelineEvent[];
    communicationPreferences?: Array<'email' | 'sms'>;
    attentionFlag?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';

export interface Lead {
    id: string;
    agencyId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    source: string;
    status: LeadStatus;
    potentialValue: number;
    createdAt: string;
    policyType: PolicyType;
    customerId?: string;
    score?: number;
    campaignId?: string;
}

export interface TransactionInquiry {
    id: string;
    agencyId: string;
    customerId?: string;
    policyType: PolicyType;
    status: 'new' | 'assigned' | 'closed';
    createdAt: string;
    details: string;
}

// Gap Analysis and Policy Parsing
export interface DetailedPolicy {
    policyNumber: string;
    insurer: string;
    policyholder: {
        name: string;
        address: string;
    };
    effectiveDate?: string;
    expirationDate?: string;
    insuredItems: Array<{
        id: string;
        description: string;
        coverages: Coverage[];
    }>;
}

export interface GapAnalysisResult {
    gaps: Array<{
        area: string;
        current: string;
        recommended: string;
        reason: string;
    }>;
    upsell_opportunities: Array<{
        product: string;
        recommendation: string;
        benefit: string;
    }>;
    cross_sell_opportunities: Array<{
        product: string;
        recommendation: string;
        benefit: string;
    }>;
}

// Campaigns & Analytics
export enum CampaignObjective {
    LEAD_GENERATION = 'lead_generation',
    BRAND_AWARENESS = 'brand_awareness',
}

export interface LeadCaptureFormField {
    name: string;
    type: 'text' | 'email' | 'tel' | 'number';
    required: boolean;
}

export interface Campaign {
    id: string;
    agencyId: string;
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
}

export interface AnalyticsRecord {
    date: string;
    campaignId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}
export type AnalyticsData = AnalyticsRecord[];


export interface ExecutiveData {
    agencyGrowth: { month: string; premium: number; policies: number }[];
    productMix: { name: PolicyType; value: number }[];
    claimsTrend: { month: string; submitted: number; approved: number; paid: number }[];
    leadFunnel: { status: LeadStatus; count: number }[];
    campaignRoi: { id: string; name: string; spend: number; revenue: number }[];
    riskExposure: { area: string; exposure: number; mitigation: number }[];
}

// User Activity and Auditing
export type UserActivityType = 'login' | 'action' | 'notification';

export interface UserActivityEvent {
    id: string;
    userId: string;
    agencyId: string;
    timestamp: string;
    type: UserActivityType;
    description: string;
    details?: Record<string, any>;
}

export interface AuditLog {
    id: string;
    agencyId: string;
    timestamp: string;
    actorName: string;
    action: 'user_invited' | 'user_removed' | 'role_changed';
    targetName: string;
    details: string;
}

// Onboarding
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}

// Google Business Profile
export type GbpStarRating = 'FIVE' | 'FOUR' | 'THREE' | 'TWO' | 'ONE' | 'STAR_RATING_UNSPECIFIED';

export interface GbpLocationSummary {
    name: string;
    title: string;
    averageRating: number;
    totalReviewCount: number;
}

export interface GbpReview {
    name: string; // The ID of the review
    reviewer: {
        profilePhotoUrl: string;
        displayName: string;
    };
    starRating: GbpStarRating;
    comment: string;
    createTime: string;
    updateTime: string;
    reply?: {
        comment: string;
        updateTime: string;
    };
}

// Misc UI
export interface SocialPlatform {
    key: string;
    name: string;
    icon: React.ReactElement;
}

// News & Testimonials
export interface NewsArticle {
    id: string;
    agencyId: 'global' | string;
    title: string;
    summary: string;
    content: string; // HTML content
    author: {
        name: string;
        avatarUrl?: string;
    };
    publishedDate: string;
    tags: string[];
    imageUrl: string;
    seo: {
        title: string;
        description: string;
    };
}

export interface Testimonial {
    id: string;
    agencyId: string;
    authorName: string;
    authorPhotoUrl?: string;
    quote: string;
    rating: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

// Automation
export type RuleCategory = 'lead_conversion' | 'communication_automation';
export type TriggerType = 'on_lead_creation' | 'on_status_change';
export type ConditionField = 'lead_status' | 'lead_score' | 'policy_interest';
export type ConditionOperator = 'is' | 'is_not' | 'equals' | 'greater_than' | 'less_than';
export type ActionType = 'send_email' | 'send_sms' | 'send_viber' | 'send_whatsapp';
export type TemplateChannel = 'email' | 'sms' | 'viber' | 'whatsapp';

export interface RuleCondition {
    id: string;
    field: ConditionField;
    operator: ConditionOperator;
    value: string;
}

export interface RuleAction {
    id: string;
    type: ActionType;
    templateId: string;
}

export interface AutomationRule {
    id: string;
    agencyId: string;
    name: string;
    description: string;
    category: RuleCategory;
    triggerType: TriggerType;
    conditions: RuleCondition[];
    actions: RuleAction[];
    isEnabled: boolean;
    lastExecuted: string | null;
    successRate: number;
}

export interface MessageTemplate {
    id: string;
    name: string;
    channel: TemplateChannel;
    content: string;
}

export interface AutomationEvent {
    id: string;
    agencyId: string;
    timestamp: string;
    ruleId: string;
    ruleName: string;
    triggerId: string;
    status: 'success' | 'failure';
    details: string;
    channel?: TemplateChannel;
    impact?: string;
}

export interface AutomationAnalytics {
    conversionRateBefore: number;
    conversionRateAfter: number;
    messagesSentByChannel: { channel: TemplateChannel, count: number }[];
}

// FIX: Add AutomationChannelSettings and related types that were missing.
export interface EmailChannelSettings {
    isEnabled: boolean;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    fromAddress?: string;
}

export interface SmsChannelSettings {
    isEnabled: boolean;
    apiKey?: string;
    apiSecret?: string;
    senderId?: string;
}

export interface ViberChannelSettings {
    isEnabled: boolean;
    apiKey?: string;
    senderName?: string;
}

export interface WhatsAppChannelSettings {
    isEnabled: boolean;
    apiKey?: string;
    phoneNumberId?: string;
}

export interface AutomationChannelSettings {
    email: EmailChannelSettings;
    viber: ViberChannelSettings;
    whatsapp: WhatsAppChannelSettings;
    sms: SmsChannelSettings;
}

export interface ConditionResult {
    condition: RuleCondition;
    passed: boolean;
    actualValue: any;
}

export interface SimulationResult {
    conditionsMet: boolean;
    conditionResults: ConditionResult[];
}

// Microsite Builder
export type BlockType = 'hero' | 'about' | 'services' | 'team' | 'testimonials' | 'faq' | 'contact' | 'news' | 'awards' | 'certificates' | 'policy_highlights' | 'location' | 'video' | 'downloads';

interface BaseBlock {
    id: string;
    type: BlockType;
}

export interface HeroBlock extends BaseBlock {
    type: 'hero';
    title: string;
    subtitle: string;
    ctaText: string;
    imageUrl: string;
}

export interface AboutBlock extends BaseBlock {
    type: 'about';
    title: string;
    content: string;
    imageUrl: string;
}

export interface ServicesBlock extends BaseBlock {
    type: 'services';
    title: string;
    services: { id: string, name: string, description: string, icon: string }[];
}

// Define other block types similarly...
export interface TeamBlock extends BaseBlock { type: 'team'; title: string; members: { id: string, name: string, role: string, imageUrl: string }[] }
export interface TestimonialsBlock extends BaseBlock { type: 'testimonials'; title: string; testimonials: { id: string, quote: string, author: string }[] }
export interface FaqBlock extends BaseBlock { type: 'faq'; title: string; items: { id: string, question: string, answer: string }[] }
export interface ContactBlock extends BaseBlock { type: 'contact'; title: string; subtitle: string }
export interface NewsBlock extends BaseBlock { type: 'news'; title: string; items: { id: string, title: string, summary: string, date: string }[] }
export interface AwardsBlock extends BaseBlock { type: 'awards'; title: string; awards: { id: string, title: string, issuer: string, year: string }[] }
export interface CertificatesBlock extends BaseBlock { type: 'certificates'; title: string; certificates: { id: string, name: string, imageUrl: string }[] }
export interface PolicyHighlightsBlock extends BaseBlock { type: 'policy_highlights'; title: string; highlights: { id: string, title: string, description: string }[] }
export interface LocationBlock extends BaseBlock { type: 'location'; title: string; address: string, googleMapsUrl: string; }
export interface VideoBlock extends BaseBlock { type: 'video'; title: string; youtubeVideoId: string; }
export interface DownloadsBlock extends BaseBlock { type: 'downloads'; title: string; files: { id: string, title: string, fileUrl: string }[] }

export type MicrositeBlock = HeroBlock | AboutBlock | ServicesBlock | TeamBlock | TestimonialsBlock | FaqBlock | ContactBlock | NewsBlock | AwardsBlock | CertificatesBlock | PolicyHighlightsBlock | LocationBlock | VideoBlock | DownloadsBlock;

export interface MicrositeConfig {
    siteTitle: string;
    themeColor: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    social: {
        facebook: string;
        linkedin: string;
        x: string;
    };
}


// ACORD Standard (Simplified)
export interface CoverageDetailACORD {
    type: string;
    limit: string;
    deductible?: string;
    premium?: number;
}
export interface InsuredPartyACORD {
    name: string;
    address: string;
}
export interface PolicyACORD {
    id: string;
    policyNumber: string;
    insurer: {
        name: string;
    };
    policyholder: InsuredPartyACORD;
    effectiveDate: string;
    expirationDate: string;
    coverages: CoverageDetailACORD[];
    totalPremium: number;
    lastUpdated: string;
    beneficiaries: InsuredPartyACORD[];
    vehicle?: {
        make: string;
        model: string;
        year: number;
        vin: string;
    };
}