import React from 'react';

// GENERAL
export enum Language {
    EN = 'en',
    EL = 'el',
}

export type TranslationTokens = {
    [key: string]: string | TranslationTokens;
};

// USER & AUTH
export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  action: 'user_invited' | 'role_changed' | 'user_removed';
  targetName: string;
  details: string;
  agencyId: string;
}

// CRM
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
    url: string;
    size: number;
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
    type: 'call' | 'email' | 'note' | 'system' | 'policy_update' | 'meeting' | 'claim';
    content: string;
    author: string;
    isFlagged?: boolean;
    attachments?: Attachment[];
    annotations?: Annotation[];
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  agencyId: string;
  attentionFlag?: string;
  communicationPreferences?: ('email' | 'sms')[];
  policies: Policy[];
  timeline: TimelineEvent[];
}

// LEADS
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
    policyType: PolicyType;
    agencyId: string;
    campaignId?: string;
    customerId?: string;
}

// GAP ANALYSIS
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

export interface Gap {
    area: string;
    current: string;
    recommended: string;
    reason: string;
}

export interface Opportunity {
    product: string;
    recommendation: string;
    benefit: string;
}

export interface GapAnalysisResult {
    gaps: Gap[];
    upsell_opportunities: Opportunity[];
    cross_sell_opportunities: Opportunity[];
}


// ONBOARDING
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}

// SOCIAL & CAMPAIGNS
export interface SocialPlatform {
    key: string;
    name: string;
    icon: React.ReactElement;
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
    network: string; // 'facebook' | 'instagram' | 'linkedin' | 'x'
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
        image?: string;
    };
    status: 'active' | 'draft' | 'completed';
    agencyId: string;
    leadCaptureForm?: {
      fields: LeadCaptureFormField[];
    }
}

// ANALYTICS
export interface AnalyticsRecord {
    campaignId: string;
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}
export type AnalyticsData = AnalyticsRecord[];

// MICROSITE BUILDER
export interface Product {
    id: string;
    name: string;
    description: string;
}

export interface Testimonial {
    id: string;
    quote: string;
    author: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export type HeroBlock = {
    id: string;
    type: 'hero';
    title: string;
    subtitle: string;
    ctaText: string;
};

export type ProductsBlock = {
    id: string;
    type: 'products';
    title: string;
    products: Product[];
};

export type TestimonialsBlock = {
    id: string;
    type: 'testimonials';
    title: string;
    testimonials: Testimonial[];
};

export type FaqBlock = {
    id: string;
    type: 'faq';
    title: string;
    items: FaqItem[];
};

export type ContactBlock = {
    id: string;
    type: 'contact';
    title: string;
    subtitle: string;
};

export type MicrositeBlock = HeroBlock | ProductsBlock | TestimonialsBlock | FaqBlock | ContactBlock;

export interface MicrositeSettings {
    themeColor: string;
    font: string;
    companyName: string;
    logoUrl?: string;
}
