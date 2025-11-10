import React from 'react';

// Basic Enums
export enum Language {
    EN = 'en',
    EL = 'el',
}

export enum PolicyType {
    AUTO = 'auto',
    HOME = 'home',
    LIFE = 'life',
    BUSINESS = 'business',
}

export enum UserSystemRole {
    ADMIN = 'admin',
    AGENT = 'agent',
}

export enum LicenseStatus {
    VALID = 'valid',
    EXPIRED = 'expired',
    PENDING_REVIEW = 'pending_review',
}

export enum CampaignObjective {
    LEAD_GENERATION = 'LEAD_GENERATION',
    BRAND_AWARENESS = 'BRAND_AWARENESS',
    WEBSITE_TRAFFIC = 'WEBSITE_TRAFFIC',
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';
export type UserActivityType = 'login' | 'action' | 'notification';

// Localization
export interface TranslationTokens {
    [key: string]: any;
}

// Social Media
export interface SocialPlatform {
    key: 'facebook' | 'linkedin' | 'x';
    name: string;
    icon: React.ReactElement;
}

// Core Data Models: User, Customer, Lead, Policy

export interface AcordLicense {
    type: string;
    licenseNumber: string;
    state: string;
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
            fullAddress?: string;
        };
        profilePhotoUrl?: string;
        signature?: string;
    };
    partyRole: {
        roleType: UserSystemRole;
        roleTitle: string;
        jobTitle?: string;
        department?: string;
        permissionsScope: 'agency' | 'global';
        licenses?: AcordLicense[];
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
    type: 'note' | 'call' | 'email' | 'meeting' | 'policy_update' | 'claim' | 'system';
    content: string;
    author: string;
    attachments?: Attachment[];
    annotations?: Annotation[];
    isFlagged?: boolean;
}

export interface Policy {
    id: string;
    policyNumber: string;
    type: PolicyType;
    startDate: string;
    endDate: string;
    premiumAmount: number;
    isActive: boolean;
    paymentDueDate?: string;
    paymentStatus?: 'paid' | 'pending' | 'overdue';
}

export interface Customer {
    id: string;
    agencyId: string;
    assignedAgentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;

    policies: Policy[];
    timeline: TimelineEvent[];
    attentionFlag?: string;
    communicationPreferences?: Array<'email' | 'sms'>;
}

export interface Lead {
    id: string;
    agencyId: string;
    campaignId: string;
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
}

// Gap Analysis Models
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

// Content Models: News, Testimonials
export interface NewsArticle {
    id: string;
    agencyId: 'global' | string;
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

// Activity & Logging
export interface UserActivityEvent {
    id: string;
    timestamp: string;
    type: UserActivityType;
    description: string;
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

// Analytics Models
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
    agencyGrowth: { month: string; premiumAmount: number; policies: number }[];
    productMix: { name: PolicyType; value: number }[];
    claimsTrend: { month: string; submitted: number; approved: number; paid: number }[];
    leadFunnel: { status: LeadStatus; count: number }[];
    campaignRoi: { id: string; name: string; spend: number; revenue: number }[];
    riskExposure: { area: string; exposure: number; mitigation: number }[];
}

// Ad Campaigns
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
    status: 'draft' | 'active' | 'completed';
    leadCaptureForm?: {
        fields: LeadCaptureFormField[];
    };
}

// Onboarding
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}

// Automation
export interface ReminderLogEntry {
    logKey: string;
    ruleId: string;
    policyId: string;
    sentAt: string;
}

export interface AutomatedTask {
    id: string;
    message: string;
    createdAt: string;
    type: 'renewal' | 'payment_reminder';
}

export interface RuleDefinition {
    id: string;
    trigger: {
        eventType: string;
        parameters: { [key: string]: any };
    };
    conditions: {
        field: string;
        operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN';
        value: any;
    }[];
    actions: {
        actionType: 'CREATE_TASK' | 'SEND_EMAIL' | 'SEND_SMS';
        template: string;
    }[];
    isEnabled: boolean;
}

// Microsite Builder
export type BlockType = 'hero' | 'about' | 'services' | 'team' | 'testimonials' | 'faq' | 'contact' | 'news' | 'awards' | 'certificates' | 'policy_highlights' | 'location' | 'video' | 'downloads';

export interface BaseBlock {
    id: string;
    type: BlockType;
    title?: string;
}

export interface HeroBlock extends BaseBlock { type: 'hero'; subtitle?: string; ctaText?: string; imageUrl?: string; }
export interface AboutBlock extends BaseBlock { type: 'about'; content?: string; imageUrl?: string; }
export interface ServicesBlock extends BaseBlock { type: 'services'; services: { id: string, name: string, description: string, icon: string }[]; }
export interface TeamBlock extends BaseBlock { type: 'team'; members: { id: string; name: string; role: string; imageUrl: string }[]; }
export interface TestimonialsBlock extends BaseBlock { type: 'testimonials'; testimonials: { id: string; quote: string; author: string }[]; }
export interface FaqBlock extends BaseBlock { type: 'faq'; items: { id: string; question: string; answer: string }[]; }
export interface ContactBlock extends BaseBlock { type: 'contact'; subtitle?: string; }
export interface NewsBlock extends BaseBlock { type: 'news'; items: { id: string; title: string; summary: string; date: string }[]; }
export interface AwardsBlock extends BaseBlock { type: 'awards'; awards: { id: string; title: string; issuer: string; year: string }[]; }
export interface CertificatesBlock extends BaseBlock { type: 'certificates'; certificates: { id: string; name: string; imageUrl: string }[]; }
export interface PolicyHighlightsBlock extends BaseBlock { type: 'policy_highlights'; highlights: { id: string; title: string; description: string }[]; }
export interface LocationBlock extends BaseBlock { type: 'location'; address?: string; googleMapsUrl?: string; }
export interface VideoBlock extends BaseBlock { type: 'video'; youtubeVideoId?: string; }
export interface DownloadsBlock extends BaseBlock { type: 'downloads'; files: { id: string; title: string; fileUrl: string }[]; }

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
