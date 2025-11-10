import React from 'react';

// enums
export enum Language {
  EN = 'en',
  EL = 'el',
}

export enum UserRole {
  AGENT = 'agent',
  ADMIN = 'admin',
}

export enum PolicyType {
  AUTO = 'auto',
  HOME = 'home',
  LIFE = 'life',
  HEALTH = 'health',
}

export enum CampaignObjective {
  LEAD_GENERATION = 'LEAD_GENERATION',
  BRAND_AWARENESS = 'BRAND_AWARENESS',
  SALES = 'SALES',
}

// CRM types
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
  customerId?: string;
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

// User and Auth types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string;
}

// Gap Analysis types
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

// Social and Campaign types
export interface SocialPlatform {
  key: string;
  name: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
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
        image?: string;
    };
    status: 'draft' | 'active' | 'completed';
    agencyId: string;
    leadCaptureForm?: {
        fields: LeadCaptureFormField[];
    };
}


// Analytics and Reporting types
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

// Localization types
export interface TranslationTokens {
  [key: string]: string | TranslationTokens;
}

// Settings and Onboarding
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
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

// Microsite Builder types
export type MicrositeBlockType = 'hero' | 'products' | 'testimonials' | 'faq' | 'contact';

interface BaseBlock {
    id: string;
    title: string;
}

export interface HeroBlock extends BaseBlock {
    type: 'hero';
    subtitle: string;
    ctaText: string;
}

export interface ProductItem {
    id: string;
    name: string;
    description: string;
}

export interface ProductsBlock extends BaseBlock {
    type: 'products';
    products: ProductItem[];
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

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface FaqBlock extends BaseBlock {
    type: 'faq';
    items: FaqItem[];
}

export interface ContactBlock extends BaseBlock {
    type: 'contact';
    subtitle: string;
}

export type MicrositeBlock = HeroBlock | ProductsBlock | TestimonialsBlock | FaqBlock | ContactBlock;

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
