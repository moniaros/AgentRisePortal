
export enum Language {
  EN = 'en',
  EL = 'el',
}

export interface TranslationTokens {
  [key: string]: string | TranslationTokens;
}

export enum PolicyType {
  AUTO = 'AUTO',
  HOME = 'HOME',
  LIFE = 'LIFE',
  HEALTH = 'HEALTH',
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
  author: string;
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

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';
  potentialValue: number;
  createdAt: string; // ISO string
  policyType: PolicyType;
  customerId?: string;
  [key: string]: any; // To allow for sorting by generic key
}

// For Ad Campaigns
export enum CampaignObjective {
    BRAND_AWARENESS = 'BRAND_AWARENESS',
    LEAD_GENERATION = 'LEAD_GENERATION',
    WEBSITE_TRAFFIC = 'WEBSITE_TRAFFIC',
}

export interface Campaign {
    id: string;
    name: string;
    objective: CampaignObjective;
    status: 'draft' | 'active' | 'paused' | 'completed';
    budget: number;
    startDate: string;
    endDate: string;
    audience: {
        ageRange: [number, number];
        interests: string[];
    };
    creative: {
        headline: string;
        body: string;
        image: string; // URL or base64
    };
}
