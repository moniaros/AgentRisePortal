import React from 'react';

// This file contains type definitions for the entire application.

// From context/LanguageContext.tsx, data/mockData.ts, etc.
export enum Language {
    EN = 'en',
    EL = 'el',
}

// From context/LanguageContext.tsx
// A generic type for translation token objects.
export type TranslationTokens = { [key: string]: any };

// From constants.tsx
export interface SocialPlatform {
    key: string;
    name: string;
    icon: React.ReactElement;
}

// From data/mockData.ts and various pages
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
    type: 'call' | 'email' | 'note' | 'meeting' | 'policy_update' | 'claim' | 'system';
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

// From pages/Analytics.tsx (from MOCK_ANALYTICS_DATA in data/mockData.ts)
export type AnalyticsData = {
    campaignId: string;
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}[];

// From data/mockData.ts, pages/UserManagement.tsx
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
    action: 'user_invited' | 'user_removed' | 'role_changed';
    targetName: string;
    details: string;
    agencyId: string;
}

// From data/mockData.ts, hooks/useCampaigns.ts
export enum CampaignObjective {
    LEAD_GENERATION = 'LEAD_GENERATION',
    BRAND_AWARENESS = 'BRAND_AWARENESS',
    WEBSITE_TRAFFIC = 'WEBSITE_TRAFFIC',
}

// From components/campaigns/steps/Step5_LeadCapture.tsx
export interface LeadCaptureFormField {
    name: string;
    type: 'text' | 'email' | 'tel' | 'number';
    required: boolean;
}

// From hooks/useCampaigns.ts and related components
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

// From pages/GapAnalysis.tsx
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

// From hooks/useOnboardingStatus.ts
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}

// Microsite Builder Types
export type BlockType = 'hero' | 'products' | 'testimonials' | 'faq' | 'contact';

export interface BaseBlock {
    id: string;
    type: BlockType;
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
