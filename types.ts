import React from 'react';

// General
export enum Language {
    EN = 'en',
    EL = 'el',
}

export interface TranslationTokens {
    [key: string]: string | TranslationTokens;
}

// User & Auth - ACORD Aligned Schema
export enum UserSystemRole {
    AGENT = 'agent',
    ADMIN = 'admin',
}

export type LicenseStatus = 'valid' | 'expired' | 'pending_review';

export interface AcordLicense {
    type: string;
    licenseNumber: string;
    expirationDate: string;
    status: LicenseStatus;
}

export interface AcordPartyRole {
    roleType: UserSystemRole; // Maps to system-level permissions
    roleTitle: string; // e.g., 'Senior Insurance Agent'
    permissionsScope: 'agency' | 'global' | 'team';
    jobTitle?: string;
    department?: string;
    licenses?: AcordLicense[];
}

export interface AcordPartyName {
    firstName: string;
    lastName: string;
}

export interface AcordContactInfo {
    email: string;
    workPhone?: string;
    mobilePhone?: string;
}

export interface AcordAddressInfo {
    fullAddress?: string; // For simplicity, using a single field. Can be expanded.
}

export interface AcordParty {
    partyName: AcordPartyName;
    contactInfo: AcordContactInfo;
    addressInfo?: AcordAddressInfo;
    profilePhotoUrl?: string; // Base64 data URL for PartyPhoto
    signature?: string; // Base64 data URL for PartySignature
}

export interface User {
    id: string;
    agencyId: string;
    party: AcordParty;
    partyRole: AcordPartyRole;
}


// User Activity
export type UserActivityType = 'login' | 'action' | 'notification';

export interface UserActivityEvent {
    id: string;
    userId: string;
    timestamp: string;
    type: UserActivityType;
    description: string;
    details?: {
        ipAddress?: string;
        targetId?: string; // e.g., leadId, policyId
    };
    agencyId: string;
}


// CRM - Leads & Customers
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';

export enum PolicyType {
    AUTO = 'auto',
    HOME = 'home',
    LIFE = 'life',
    HEALTH = 'health',
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
    policyType: PolicyType;
    agencyId: string;
    customerId?: string;
    campaignId?: string;
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

export interface Attachment {
    name: string;
    size: number;
    url: string;
}

export interface Annotation {
    id: string;
    date: string;
    content: string;
    author: string;
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

// Gap Analysis
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

export interface GapAnalysisResult {
    gaps: {
        area: string;
        current: string;
        recommended: string;
        reason: string;
    }[];
    upsell_opportunities: {
        product: string;
        recommendation: string;
        benefit: string;
    }[];
    cross_sell_opportunities: {
        product: string;
        recommendation: string;
        benefit: string;
    }[];
}

// Social & Campaigns
export interface SocialPlatform {
    key: string;
    name: string;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

export enum CampaignObjective {
    LEAD_GENERATION = 'lead_generation',
    BRAND_AWARENESS = 'brand_awareness',
    SALES = 'sales',
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
    status: 'draft' | 'active' | 'completed';
    agencyId: string;
    leadCaptureForm?: {
        fields: LeadCaptureFormField[];
    };
}

// Testimonials
export interface Testimonial {
    id: string;
    authorName: string;
    authorPhotoUrl?: string;
    quote: string;
    rating: number; // 1 to 5
    status: 'pending' | 'approved' | 'rejected';
    agencyId: string;
    createdAt: string;
}

// Analytics & Admin
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


// Onboarding
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}

// News & Announcements
export interface NewsArticle {
    id: string; // slug
    title: string;
    summary: string;
    content: string; // Can contain basic HTML
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
    agencyId: 'global' | string; // 'global' for all agencies
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

export interface ServiceItem {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface ServicesBlock extends BaseBlock {
    type: 'services';
    title: string;
    services: ServiceItem[];
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
    bio: string;
}

export interface TeamBlock extends BaseBlock {
    type: 'team';
    title: string;
    members: TeamMember[];
}

export interface TestimonialItem {
    id: string;
    quote: string;
    author: string;
}

export interface TestimonialsBlock extends BaseBlock {
    type: 'testimonials';
    title: string;
    testimonials: TestimonialItem[];
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

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    date: string;
}
export interface NewsBlock extends BaseBlock {
    type: 'news';
    title: string;
    items: NewsItem[];
}
export interface AwardItem {
    id: string;
    title: string;
    issuer: string;
    year: string;
}
export interface AwardsBlock extends BaseBlock {
    type: 'awards';
    title: string;
    awards: AwardItem[];
}

export interface CertificateItem {
    id: string;
    name: string;
    imageUrl: string;
}

export interface CertificatesBlock extends BaseBlock {
    type: 'certificates',
    title: string;
    certificates: CertificateItem[];
}

export interface PolicyHighlightItem {
    id: string;
    title: string;
    description: string;
}

export interface PolicyHighlightsBlock extends BaseBlock {
    type: 'policy_highlights',
    title: string;
    highlights: PolicyHighlightItem[];
}

export interface LocationBlock extends BaseBlock {
    type: 'location',
    title: string;
    address: string;
    googleMapsUrl: string;
}

export interface VideoBlock extends BaseBlock {
    type: 'video',
    title: string;
    youtubeVideoId: string;
}
export interface DownloadItem {
    id: string;
    title: string;
    fileUrl: string;
}

export interface DownloadsBlock extends BaseBlock {
    type: 'downloads',
    title: string;
    files: DownloadItem[];
}

export type MicrositeBlock = 
    | HeroBlock 
    | AboutBlock 
    | ServicesBlock 
    | TeamBlock
    | TestimonialsBlock 
    | FaqBlock 
    | ContactBlock
    | NewsBlock
    | AwardsBlock
    | CertificatesBlock
    | PolicyHighlightsBlock
    | LocationBlock
    | VideoBlock
    | DownloadsBlock;

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

// Rules Engine
export enum RuleCategory {
    RENEWAL_REMINDER = 'RENEWAL_REMINDER',
    PAYMENT_REMINDER = 'PAYMENT_REMINDER',
    LEAD_ASSIGNMENT = 'LEAD_ASSIGNMENT',
    TASK_CREATION = 'TASK_CREATION',
}

export enum TriggerEventType {
    POLICY_EXPIRING_SOON = 'POLICY_EXPIRING_SOON',
    NEW_LEAD_CREATED = 'NEW_LEAD_CREATED',
    PAYMENT_DUE = 'PAYMENT_DUE',
    POLICY_CREATED = 'POLICY_CREATED',
}

export enum ConditionOperator {
    EQUALS = 'EQUALS',
    NOT_EQUALS = 'NOT_EQUALS',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN',
    CONTAINS = 'CONTAINS',
    IN = 'IN',
    IS_EMPTY = 'IS_EMPTY',
}

export enum ActionType {
    SEND_EMAIL = 'SEND_EMAIL',
    SEND_SMS = 'SEND_SMS',
    CREATE_TASK = 'CREATE_TASK',
    ASSIGN_LEAD = 'ASSIGN_LEAD',
}

export interface Trigger {
    eventType: TriggerEventType;
    parameters?: Record<string, any>;
}

export interface Condition {
    field: string; // e.g., 'policy.type', 'lead.potentialValue'
    operator: ConditionOperator;
    value: any; // e.g., 'auto', 1000
}

export interface Action {
    actionType: ActionType;
    target: 'AGENT' | 'CUSTOMER' | 'SYSTEM';
    template?: string; // e.g., 'Your policy {policy.policyNumber} is expiring soon.'
    parameters?: Record<string, any>; // e.g., { assignToAgentId: 'user_123' }
}

export interface RuleDefinition {
    id: string;
    name: string;
    description: string;
    category: RuleCategory;
    trigger: Trigger;
    conditions: Condition[];
    actions: Action[];
    priority: number;
    isEnabled: boolean;
    agencyId: 'global' | string;
}