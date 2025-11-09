export enum Language {
  EN = 'en',
  EL = 'el',
}

export interface TranslationTokens {
  [key: string]: string | TranslationTokens;
}

export enum PolicyType {
  AUTO = 'auto',
  HOME = 'home',
  LIFE = 'life',
  HEALTH = 'health',
  TRAVEL = 'travel',
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';
  potentialValue: number;
  createdAt: string; // ISO string
  policyType: PolicyType;
  customerId?: string;
}

export interface Policy {
  id: string;
  type: PolicyType;
  policyNumber: string;
  insurer: string;
  premium: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isActive: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string; // ISO string
  type: 'note' | 'call' | 'email' | 'meeting' | 'policy_update' | 'policy_renewal' | 'premium_reminder' | 'address_change' | 'ai_review';
  title: string;
  content: string;
  author: string; // e.g., 'System', 'Agent Name'
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string; // ISO string
  policies: Policy[];
  timeline: TimelineEvent[];
}
