import React from 'react';

export enum Language {
    EN = 'en',
    EL = 'el',
}

export type TranslationTokens = { [key: string]: string | TranslationTokens };

export interface SocialPlatform {
    key: string;
    name: string;
    icon: React.ReactElement;
}

export enum PolicyType {
    AUTO = 'auto',
    HOME = 'home',
    LIFE = 'life',
    HEALTH = 'health',
    OTHER = 'other',
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
    url: string; // For MVP, this will be a placeholder
    size: number; // in bytes
}

export interface TimelineEvent {
    id: string;
    date: string;
    type: 'note' | 'call' | 'email' | 'meeting' | 'policy_update' | 'claim' | 'system';
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
  phone: string;
  address: string;
  dateOfBirth: string;
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
  customerId?: string;
  status: LeadStatus;
  policyType: PolicyType;
  potentialValue: number;
  createdAt: string;
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
    status: 'draft' | 'active' | 'completed' | 'paused';
    leadCaptureForm?: {
        fields: LeadCaptureFormField[];
    };
    agencyId: string;
}

export type AnalyticsData = {
    campaignId: string;
    date: string; // YYYY-MM-DD
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}[];

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
