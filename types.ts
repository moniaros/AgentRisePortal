import React from 'react';

// General
export enum Language {
    EN = 'en',
    EL = 'el',
}

export type TranslationTokens = { [key: string]: any };

// User Management & Auth
export enum UserRole {
    ADMIN = 'admin',
    AGENT = 'agent',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    agencyId: string;
}

// CRM & Leads
export enum PolicyType {
    AUTO = 'auto',
    HOME = 'home',
    LIFE = 'life',
    HEALTH = 'health',
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';

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
    policyType: PolicyType;
    agencyId: string;
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
    type: 'note' | 'call' | 'email' | 'meeting' | 'system' | 'policy_update' | 'claim';
    content: string;
    author: string;
    annotations?: Annotation[];
    attachments?: Attachment[];
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

// Social & Campaigns
export interface SocialPlatform {
    key: string;
    name: string;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

export enum CampaignObjective {
    LEAD_GENERATION = 'lead_generation',
    BRAND_AWARENESS = 'brand_awareness',
    WEBSITE_TRAFFIC = 'website_traffic',
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
    network: string; // e.g., 'facebook', 'instagram'
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
    }
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


// Analytics & Reporting
export interface AnalyticsRecord {
    date: string;
    campaignId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}

export type AnalyticsData = AnalyticsRecord[];

export interface AuditLog {
    id: string;
    timestamp: string;
    actorName: string;
    action: 'user_invited' | 'user_removed' | 'role_changed';
    targetName: string;
    details: string;
    agencyId: string;
}

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

// Microsite Builder
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

export type MicrositeBlockType = 'hero' | 'about' | 'services' | 'awards' | 'testimonials' | 'news' | 'contact' | 'faq';

export interface BaseBlock {
    id: string;
    type: MicrositeBlockType;
    isLoading?: boolean;
    title: string;
}

export interface HeroBlock extends BaseBlock {
    type: 'hero';
    subtitle: string;
    ctaText: string;
}

export interface AboutBlock extends BaseBlock {
    type: 'about';
    content: string;
    imageUrl: string;
}

export interface ServiceItem {
    id: string;
    name: string;
    description: string;
}

export interface ServicesBlock extends BaseBlock {
    type: 'services';
    services: ServiceItem[];
}

export interface AwardItem {
    id: string;
    title: string;
    issuer: string;
    year: string;
}

export interface AwardsBlock extends BaseBlock {
    type: 'awards';
    awards: AwardItem[];
}

export interface TestimonialItem {
    id: string;
    quote: string;
    author: string;
}

export interface TestimonialsBlock extends BaseBlock {
    type: 'testimonials';
    testimonials: TestimonialItem[];
}

export interface NewsItem {
    id: string;
    title: string;
    date: string;
    summary: string;
}

export interface NewsBlock extends BaseBlock {
    type: 'news';
    items: NewsItem[];
}

export interface ContactBlock extends BaseBlock {
    type: 'contact';
    subtitle: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface FaqBlock extends BaseBlock {
    type: 'faq';
    items: FaqItem[];
}

export type MicrositeBlock = HeroBlock | AboutBlock | ServicesBlock | AwardsBlock | TestimonialsBlock | NewsBlock | ContactBlock | FaqBlock;
