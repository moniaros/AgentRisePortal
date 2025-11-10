import React from 'react';

// ===== ENUMS =====

export enum Language {
    EN = 'en',
    EL = 'el',
}

export enum UserSystemRole {
    ADMIN = 'admin',
    AGENT = 'agent',
}

export enum PolicyType {
    AUTO = 'auto',
    HOME = 'home',
    LIFE = 'life',
    HEALTH = 'health',
    BUSINESS = 'business',
}

export enum LicenseStatus {
    VALID = 'valid',
    EXPIRED = 'expired',
    PENDING_REVIEW = 'pending_review',
}

export enum CampaignObjective {
    LEAD_GENERATION = 'LEAD_GENERATION',
    BRAND_AWARENESS = 'BRAND_AWARENESS',
    SALES = 'SALES',
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';
export type UserActivityType = 'login' | 'action' | 'notification';

// ===== CORE DATA MODELS =====

export interface User {
    id: string;
    agencyId: string;
    party: Party;
    partyRole: PartyRole;
}

export interface Party {
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
        fullAddress?: string;
    };
    profilePhotoUrl?: string;
    signature?: string; // Base64 string
}

export interface PartyRole {
    roleType: UserSystemRole;
    roleTitle: string;
    jobTitle?: string;
    department?: string;
    permissionsScope: string;
    licenses?: AcordLicense[];
}

export interface AcordLicense {
    type: string;
    licenseNumber: string;
    state: string;
    expirationDate: string;
    status: LicenseStatus;
}

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
    agencyId: string;
    assignedAgentId: string;
    communicationPreferences?: ('email' | 'sms')[];
}

export interface Policy {
    id: string;
    policyNumber: string;
    type: PolicyType;
    startDate: string;
    endDate: string;
    premium: number;
    isActive: boolean;
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
    agencyId: string;
    campaignId: string;
    policyType: PolicyType;
    customerId?: string;
}

// ===== UI & CONTEXT =====

export interface SocialPlatform {
    key: 'facebook' | 'linkedin' | 'x';
    name: string;
    icon: JSX.Element;
}

export interface TranslationTokens {
  [key: string]: any;
}

// ===== FEATURES =====

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
        coverages: {
            type: string;
            limit: string;
            deductible?: string;
        }[];
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

// Timeline
export interface Annotation {
    id: string;
    date: string;
    author: string;
    content: string;
}

export interface Attachment {
    name: string;
    url: string;
    size: number; // in bytes
}

export interface TimelineEvent {
    id: string;
    date: string;
    type: 'note' | 'call' | 'email' | 'meeting' | 'policy_update' | 'claim' | 'system';
    content: string;
    author: string;
    isFlagged?: boolean;
    annotations?: Annotation[];
    attachments?: Attachment[];
}

// Onboarding
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}

// Campaigns
export interface Campaign {
    id: string;
    name: string;
    objective: CampaignObjective;
    network: 'facebook' | 'instagram' | 'linkedin' | 'google';
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
    }
}

export interface LeadCaptureFormField {
    name: string;
    type: 'text' | 'email' | 'tel' | 'number';
    required: boolean;
}


// Analytics
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
export interface AboutBlock extends BaseBlock { type: 'about', title: string; content: string; imageUrl: string }
export interface ServicesBlock extends BaseBlock { type: 'services', title: string; services: { id: string; name: string; description: string; icon: string }[] }
export interface TeamBlock extends BaseBlock { type: 'team', title: string; members: { id: string; name: string; role: string; imageUrl: string }[] }
export interface TestimonialsBlock extends BaseBlock { type: 'testimonials', title: string; testimonials: { id: string; quote: string; author: string }[] }
export interface FaqBlock extends BaseBlock { type: 'faq', title: string; items: { id: string; question: string; answer: string }[] }
export interface ContactBlock extends BaseBlock { type: 'contact', title: string; subtitle: string; }
export interface NewsBlock extends BaseBlock { type: 'news', title: string; items: { id: string; title: string; summary: string; date: string }[] }
export interface AwardsBlock extends BaseBlock { type: 'awards', title: string; awards: { id: string; title: string; issuer: string; year: string }[] }
export interface CertificatesBlock extends BaseBlock { type: 'certificates', title: string; certificates: { id: string; name: string; imageUrl: string }[] }
export interface PolicyHighlightsBlock extends BaseBlock { type: 'policy_highlights', title: string; highlights: { id: string; title: string; description: string }[] }
export interface LocationBlock extends BaseBlock { type: 'location', title: string; address: string; googleMapsUrl: string }
export interface VideoBlock extends BaseBlock { type: 'video', title: string; youtubeVideoId: string }
export interface DownloadsBlock extends BaseBlock { type: 'downloads', title: string; files: { id: string; title: string; fileUrl: string }[] }


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

// Executive Dashboard
export interface ExecutiveData {
    agencyGrowth: { month: string; premium: number; policies: number }[];
    productMix: { name: PolicyType; value: number }[];
    claimsTrend: { month: string; submitted: number; approved: number; paid: number }[];
    leadFunnel: { status: LeadStatus; count: number }[];
    campaignRoi: { id: string; name: string; spend: number; revenue: number }[];
    riskExposure: { area: string; exposure: number; mitigation: number }[];
}

// News & Testimonials
export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    content: string; // HTML content
    imageUrl: string;
    publishedDate: string;
    author: {
        name: string;
        avatarUrl?: string;
    };
    tags: string[];
    agencyId: string; // 'global' or specific agency ID
    seo: {
        title: string;
        description: string;
    };
}

export interface Testimonial {
    id: string;
    authorName: string;
    authorPhotoUrl?: string;
    quote: string;
    rating: number; // 1-5
    status: 'pending' | 'approved' | 'rejected';
    agencyId: string;
    createdAt: string;
}

export interface UserActivityEvent {
    id: string;
    timestamp: string;
    type: UserActivityType;
    description: string;
}

// Automation
export interface AutomatedTask {
    id: string;
    type: 'RENEWAL_REMINDER' | 'PAYMENT_DUE';
    policyId: string;
    customerId: string;
    agentId: string;
    message: string;
    createdAt: string;
}

export interface ReminderLogEntry {
    logKey: string; // e.g., `${rule.id}_${policy.id}`
    policyId: string;
    ruleId: string;
    sentAt: string;
}

export interface RuleDefinition {
    id: string;
    name: string;
    isEnabled: boolean;
    trigger: {
        eventType: 'POLICY_EXPIRING_SOON';
        parameters?: {
            daysBefore: number;
        };
    };
    conditions: {
        field: string;
        operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN';
        value: any;
    }[];
    actions: {
        actionType: 'CREATE_TASK' | 'SEND_EMAIL' | 'SEND_SMS';
        template?: string;
        parameters?: {
            templateId?: string;
        };
    }[];
}

export interface EmailTemplate {
    id: string;
    [Language.EN]: { subject: string; body: string };
    [Language.EL]: { subject: string; body: string };
}

export interface SmsTemplate {
    id: string;
    [Language.EN]: string;
    [Language.EL]: string;
}