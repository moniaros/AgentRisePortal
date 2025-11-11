import React from "react";

export enum Language {
    EN = 'en',
    EL = 'el'
}

export type TranslationTokens = {
    [key: string]: string | TranslationTokens;
};

export interface SocialPlatform {
    key: string;
    name: string;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

export enum UserSystemRole {
    AGENT = 'agent',
    ADMIN = 'admin'
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
        permissionsScope: string;
        jobTitle?: string;
        department?: string;
        licenses?: AcordLicense[];
    };
}

export enum PolicyType {
    AUTO = 'auto',
    HOME = 'home',
    LIFE = 'life',
    HEALTH = 'health'
}

export interface Coverage {
    type: string;
    limit: string;
    deductible?: string;
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

export interface Annotation {
    id: string;
    date: string;
    content: string;
    author: string;
}

export interface Attachment {
    name: string;
    size: number;
    url: string;
}

export interface TimelineEvent {
    id: string;
    date: string;
    type: 'note' | 'call' | 'email' | 'meeting' | 'policy_update' | 'claim' | 'system';
    content: string;
    author: string;
    attachments?: Attachment[];
    annotations?: Annotation[];
    isFlagged?: boolean;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    communicationPreferences: ('email' | 'sms')[];
    policies: Policy[];
    timeline: TimelineEvent[];
    agencyId: string;
    attentionFlag?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';

export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    source: string;
    campaignId?: string;
    status: LeadStatus;
    potentialValue: number;
    createdAt: string;
    policyType: PolicyType;
    agencyId: string;
    score?: number;
    customerId?: string;
}

export enum CampaignObjective {
    LEAD_GENERATION = 'LEAD_GENERATION',
    BRAND_AWARENESS = 'BRAND_AWARENESS'
}

export interface AuditLog {
    id: string;
    timestamp: string;
    actorName: string;
    action: 'user_invited' | 'user_removed' | 'role_changed';
    targetName: string;
    details: string;
    agencyId: string;
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

export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    content: string;
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
    agencyId: 'global' | string;
}

export interface Testimonial {
    id: string;
    authorName: string;
    authorPhotoUrl?: string;
    quote: string;
    rating: number;
    status: 'pending' | 'approved' | 'rejected';
    agencyId: string;
    createdAt: string;
}

export type UserActivityType = 'login' | 'action' | 'notification';

export interface UserActivityEvent {
    id: string;
    userId: string;
    timestamp: string;
    type: UserActivityType;
    description: string;
    details?: Record<string, any>;
    agencyId: string;
}

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
        coverages: Coverage[];
    }[];
}

// ACORD-aligned policy structure for storage
export interface InsuredPartyACORD {
    name: string;
    address: string;
}

export interface CoverageDetailACORD {
    type: string;
    limit: string;
    deductible?: string;
    premium?: number;
}

export interface InsuredVehicleACORD {
    vin: string;
    make: string;
    model: string;
    year: number;
}

export interface PolicyACORD {
    id: string; // Unique ID, can be policyNumber
    policyNumber: string;
    insurer: {
        name: string;
    };
    policyholder: InsuredPartyACORD;
    beneficiaries?: InsuredPartyACORD[];
    effectiveDate: string; // ISO 8601
    expirationDate: string; // ISO 8601
    coverages: CoverageDetailACORD[];
    totalPremium: number;
    vehicle?: InsuredVehicleACORD;
    lastUpdated: string; // ISO 8601 timestamp for versioning
}


export interface GbpLocationSummary {
    title: string;
    averageRating: number;
    totalReviewCount: number;
}

export type GbpStarRating = 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';

export interface GbpReview {
    name: string;
    starRating: GbpStarRating;
    comment: string;
    createTime: string;
    updateTime: string;
    reviewer: {
        displayName: string;
        profilePhotoUrl: string;
    };
    reply?: {
        comment: string;
        updateTime: string;
    };
}

export type RuleCategory = 'lead_conversion' | 'communication_automation';
export type TriggerType = 'on_lead_creation' | 'on_status_change';
export type ConditionField = 'lead_status' | 'lead_score' | 'policy_interest';
export type ConditionOperator = 'is' | 'is_not' | 'equals' | 'greater_than' | 'less_than';
export type ActionType = 'send_email' | 'send_sms' | 'send_viber' | 'send_whatsapp';

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
    name: string;
    description: string;
    category: RuleCategory;
    triggerType: TriggerType;
    conditions: RuleCondition[];
    actions: RuleAction[];
    isEnabled: boolean;
    lastExecuted: string | null;
    successRate: number;
    agencyId: string;
}

export type TemplateChannel = 'email' | 'sms' | 'viber' | 'whatsapp';

export interface MessageTemplate {
    id: string;
    name: string;
    channel: TemplateChannel;
    content: string;
}

export interface AutomationEvent {
    id: string;
    timestamp: string;
    ruleId: string;
    ruleName: string;
    status: 'success' | 'failure';
    details: string;
    impact?: string;
    channel?: TemplateChannel;
    agencyId: string;
}

export interface AutomationAnalytics {
    conversionRateBefore: number;
    conversionRateAfter: number;
    messagesSentByChannel: { channel: TemplateChannel; count: number }[];
}

export interface LeadCaptureFormField {
    name: string;
    type: 'text' | 'email' | 'tel' | 'number';
    required: boolean;
}

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
    agencyId: string;
    leadCaptureForm?: {
        fields: LeadCaptureFormField[];
    };
}

// Microsite Builder Types
export type BlockType = 
    'hero' | 'about' | 'services' | 'team' | 'testimonials' | 'faq' | 'contact' | 'news' | 
    'awards' | 'certificates' | 'policy_highlights' | 'location' | 'video' | 'downloads';

export interface BaseBlock {
    id: string;
    type: BlockType;
    title?: string;
}

export interface HeroBlock extends BaseBlock {
    type: 'hero';
    subtitle?: string;
    ctaText?: string;
    imageUrl?: string;
}

export interface AboutBlock extends BaseBlock {
    type: 'about';
    content?: string;
    imageUrl?: string;
}

export interface ServicesBlock extends BaseBlock {
    type: 'services';
    services: { id: string; name: string; description: string; icon?: string }[];
}

export interface TeamBlock extends BaseBlock {
    type: 'team';
    members: { id: string; name: string; role: string; imageUrl: string }[];
}

export interface TestimonialsBlock extends BaseBlock {
    type: 'testimonials';
    testimonials: { id: string; quote: string; author: string }[];
}

export interface FaqBlock extends BaseBlock {
    type: 'faq';
    items: { id: string; question: string; answer: string }[];
}

export interface ContactBlock extends BaseBlock {
    type: 'contact';
    subtitle?: string;
}

export interface NewsBlock extends BaseBlock {
    type: 'news';
    items: { id: string; title: string; summary: string; date: string }[];
}

export interface AwardsBlock extends BaseBlock {
    type: 'awards';
    awards: { id: string; title: string; issuer: string; year: string }[];
}

export interface CertificatesBlock extends BaseBlock {
    type: 'certificates';
    certificates: { id: string; name: string; imageUrl: string }[];
}

export interface PolicyHighlightsBlock extends BaseBlock {
    type: 'policy_highlights';
    highlights: { id: string; title: string; description: string; icon?: string }[];
}

export interface LocationBlock extends BaseBlock {
    type: 'location';
    address: string;
    googleMapsUrl: string;
}

export interface VideoBlock extends BaseBlock {
    type: 'video';
    youtubeVideoId: string;
}

export interface DownloadsBlock extends BaseBlock {
    type: 'downloads';
    files: { id: string; title: string; fileUrl: string }[];
}

export type MicrositeBlock = 
    HeroBlock | AboutBlock | ServicesBlock | TeamBlock | TestimonialsBlock | FaqBlock | ContactBlock | 
    NewsBlock | AwardsBlock | CertificatesBlock | PolicyHighlightsBlock | LocationBlock | VideoBlock | DownloadsBlock;

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

export interface GapAnalysisResult {
    gaps: { area: string; current: string; recommended: string; reason: string }[];
    upsell_opportunities: { product: string; recommendation: string; benefit: string }[];
    cross_sell_opportunities: { product: string; recommendation: string; benefit: string }[];
}

export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
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

export interface AutomationChannelSettings {
    email: {
        isEnabled: boolean;
        host?: string;
        port?: number;
        username?: string;
        password?: string;
        fromAddress?: string;
    };
    viber: {
        isEnabled: boolean;
        apiKey?: string;
        senderName?: string;
    };
    whatsapp: {
        isEnabled: boolean;
        apiKey?: string;
        phoneNumberId?: string;
    };
    sms: {
        isEnabled: boolean;
        apiKey?: string;
        apiSecret?: string;
        senderId?: string;
    };
}