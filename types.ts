
export enum Language {
  EN = 'en',
  EL = 'el',
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
    WEBSITE_TRAFFIC = 'WEBSITE_TRAFFIC',
}

export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string;
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
  type: 'note' | 'call' | 'email' | 'meeting' | 'policy_update' | 'claim' | 'system';
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
  phone: string;
  address: string;
  dateOfBirth: string;
  agencyId: string;
  attentionFlag?: string;
  communicationPreferences: ('email' | 'sms')[];
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
    policyholder: { name: string; address: string };
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

export interface TranslationTokens {
  [key: string]: string | TranslationTokens;
}

export interface SocialPlatform {
  key: string;
  name: string;
  icon: React.ReactElement;
}

export interface AnalyticsDataRecord {
    campaignId: string;
    date: string; // YYYY-MM-DD
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}

export type AnalyticsData = AnalyticsDataRecord[];

export interface AuditLog {
    id: string;
    timestamp: string;
    actorName: string;
    action: 'user_invited' | 'user_removed' | 'role_changed';
    targetName: string;
    details: string;
    agencyId: string;
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
    status: 'active' | 'draft' | 'completed';
    leadCaptureForm?: {
        fields: LeadCaptureFormField[];
    };
    agencyId: string;
}

export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}
