// FIX: Import ReactElement to resolve 'Cannot find namespace React' error.
import type { ReactElement } from 'react';

// Language and Localization
export enum Language {
  EN = 'en',
  EL = 'el',
}

export interface TranslationTokens {
  [key: string]: string | TranslationTokens;
}

// User and Auth
export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string; // Links user to an agency
}

// CRM
export enum PolicyType {
  AUTO = 'auto',
  HOME = 'home',
  LIFE = 'life',
  HEALTH = 'health',
}

export interface Policy {
  id: string;
  type: PolicyType;
  policyNumber: string;
  insurer: string;
  premium: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string; // ISO 8601
  type: 'call' | 'email' | 'meeting' | 'note' | 'policy_update' | 'policy_renewal' | 'premium_reminder' | 'address_change' | 'ai_review';
  title: string;
  content: string;
  author: string; // 'Agent', 'System', etc.
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string; // YYYY-MM-DD
  policies: Policy[];
  timeline: TimelineEvent[];
  agencyId: string;
}

// Leads
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string; // e.g., 'Facebook', 'Website', 'Referral'
  status: LeadStatus;
  policyType: PolicyType;
  potentialValue: number;
  createdAt: string; // ISO 8601
  customerId?: string; // ID of the created customer profile
  agencyId: string;
  campaignId?: string;
}

// Social & Marketing
export interface SocialPlatform {
  key: string;
  name: string;
  icon: ReactElement;
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
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  creative: {
    headline: string;
    body: string;
    image: string; // URL
  };
  status: 'active' | 'draft' | 'completed';
  leadCaptureForm?: {
    fields: LeadCaptureFormField[];
  };
  agencyId: string;
}

// Analytics
export type AnalyticsDataRecord = {
    date: string; // YYYY-MM-DD
    campaignId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
};

export type AnalyticsData = AnalyticsDataRecord[];

// User Management
export interface AuditLog {
    id: string;
    timestamp: string; // ISO 8601
    actorName: string;
    action: 'user_invited' | 'user_removed' | 'role_changed';
    targetName: string;
    details: string;
    agencyId: string;
}