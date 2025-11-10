// types.ts
// FIX: Import ReactNode to be used for component types.
import { ReactNode } from 'react';

export enum Language {
  EN = 'en',
  EL = 'el',
}

export type TranslationTokens = {
  [key: string]: string | TranslationTokens;
};

// ACORD-like data structures
export interface PartyName {
  firstName: string;
  lastName: string;
}

export interface ContactInfo {
  email: string;
  workPhone?: string;
  mobilePhone?: string;
}

export interface AddressInfo {
    fullAddress: string;
}

export interface Party {
  partyName: PartyName;
  contactInfo: ContactInfo;
  addressInfo?: AddressInfo;
  profilePhotoUrl?: string;
  signature?: string; // base64 data URL
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

export interface AcordLicense {
    type: string;
    licenseNumber: string;
    state: string;
    expirationDate: string;
    status: LicenseStatus;
}

export interface PartyRole {
    roleType: UserSystemRole;
    roleTitle: string;
    jobTitle?: string;
    department?: string;
    permissionsScope: 'agency' | 'global';
    licenses?: AcordLicense[];
}

export interface User {
  id: string;
  party: Party;
  partyRole: PartyRole;
  agencyId: string;
}

// CRM types
export enum PolicyType {
  AUTO = 'auto',
  HOME = 'home',
  LIFE = 'life',
  HEALTH = 'health',
  BUSINESS = 'business'
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
    size: number; // in bytes
    url: string;
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
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  policies: Policy[];
  timeline: TimelineEvent[];
  agencyId: string;
  assignedAgentId: string;
  communicationPreferences: ('email' | 'sms')[];
  attentionFlag?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string; // e.g., 'Website', 'Facebook Ad'
  status: LeadStatus;
  potentialValue: number;
  createdAt: string;
  policyType: PolicyType;
  agencyId: string;
  campaignId?: string;
  customerId?: string; // Link to a created customer profile
}

// Gap Analysis types
export interface DetailedPolicy {
    policyholder: { name: string; address: string; };
    policyNumber: string;
    insurer: string;
    insuredItems: {
        id: string;
        description: string;
        coverages: { type: string; limit: string; deductible?: string; }[];
    }[];
}

export interface GapAnalysisResult {
    gaps: { area: string; current: string; recommended: string; reason: string; }[];
    upsell_opportunities: { product: string; recommendation: string; benefit: string; }[];
    cross_sell_opportunities: { product: string; recommendation: string; benefit: string; }[];
}

// Onboarding types
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}

// Automation and Dashboard types
export interface AutomatedTask {
    id: string;
    type: 'RENEWAL_REMINDER';
    policyId: string;
    customerId: string;
    agentId: string;
    message: string;
    createdAt: string;
}

export interface ReminderLogEntry {
    logKey: string; // e.g., policyId_30_days
    policyId: string;
    reminderInterval: number;
    sentAt: string;
}

// Social Composer & Ads types
export interface SocialPlatform {
    key: string;
    name: string;
    // FIX: Changed type from JSX.Element to ReactNode to avoid namespace error.
    icon: ReactNode;
}

export enum CampaignObjective {
    LEAD_GENERATION = 'LEAD_GENERATION',
    BRAND_AWARENESS = 'BRAND_AWARENESS',
    WEBSITE_TRAFFIC = 'WEBSITE_TRAFFIC'
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
    status: 'active' | 'draft' | 'completed';
    leadCaptureForm?: {
        fields: LeadCaptureFormField[];
    };
    agencyId: string;
}

// Analytics types
export interface AnalyticsRecord {
    date: string; // YYYY-MM-DD
    campaignId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}
export type AnalyticsData = AnalyticsRecord[];

// User Management types
export interface AuditLog {
    id: string;
    timestamp: string;
    actorName: string;
    action: 'user_invited' | 'user_removed' | 'role_changed';
    targetName: string;
    details: string;
    agencyId: string;
}

// Executive Dashboard types
export interface ExecutiveData {
    agencyGrowth: { month: string; premium: number; policies: number; }[];
    productMix: { name: PolicyType; value: number; }[];
    claimsTrend: { month: string; submitted: number; approved: number; paid: number; }[];
    leadFunnel: { status: LeadStatus; count: number; }[];
    campaignRoi: { id: string; name: string; spend: number; revenue: number; }[];
    riskExposure: { area: string; exposure: number; mitigation: number; }[];
}

// News types
export interface NewsArticle {
    id: string;
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
    agencyId: 'global' | string;
    seo: {
        title: string;
        description: string;
    }
}

// Testimonials
export interface Testimonial {
    id: string;
    authorName: string;
    authorPhotoUrl?: string;
    quote: string;
    rating: number; // 1-5
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    agencyId: string;
}

// User Activity
export type UserActivityType = 'login' | 'action' | 'notification';

export interface UserActivityEvent {
    id: string;
    timestamp: string;
    type: UserActivityType;
    description: string;
}

// Microsite Builder types
export type BlockType = 'hero' | 'about' | 'services' | 'team' | 'testimonials' | 'faq' | 'contact' | 'news' | 'awards' | 'certificates' | 'policy_highlights' | 'location' | 'video' | 'downloads';

export interface BaseBlock {
    id: string;
    type: BlockType;
}

export interface HeroBlock extends BaseBlock {
    type: 'hero';
    title: string;
    subtitle: string;
    ctaText: string;
    imageUrl: string;
}

export interface AboutBlock extends BaseBlock {
    type: 'about';
    title: string;
    content: string;
    imageUrl: string;
}

export interface ServicesBlock extends BaseBlock {
    type: 'services';
    title: string;
    services: { id: string; name: string; description: string; icon: string; }[];
}

export interface TeamBlock extends BaseBlock {
    type: 'team';
    title: string;
    members: { id: string; name: string; role: string; imageUrl: string; }[];
}

export interface TestimonialsBlock extends BaseBlock {
    type: 'testimonials';
    title: string;
    testimonials: { id: string; quote: string; author: string; }[];
}

export interface FaqBlock extends BaseBlock {
    type: 'faq';
    title: string;
    items: { id: string; question: string; answer: string; }[];
}

export interface ContactBlock extends BaseBlock {
    type: 'contact';
    title: string;
    subtitle: string;
}

export interface NewsBlock extends BaseBlock {
    type: 'news';
    title: string;
    items: { id: string, title: string; summary: string, date: string }[];
}

export interface AwardsBlock extends BaseBlock {
    type: 'awards';
    title: string;
    awards: { id: string, title: string; issuer: string; year: string }[];
}

export interface CertificatesBlock extends BaseBlock {
    type: 'certificates';
    title: string;
    certificates: { id: string, name: string; imageUrl: string }[];
}

export interface PolicyHighlightsBlock extends BaseBlock {
    type: 'policy_highlights';
    title: string;
    highlights: { id: string, title: string; description: string }[];
}

export interface LocationBlock extends BaseBlock {
    type: 'location';
    title: string;
    address: string;
    googleMapsUrl: string;
}

export interface VideoBlock extends BaseBlock {
    type: 'video';
    title: string;
    youtubeVideoId: string;
}

export interface DownloadsBlock extends BaseBlock {
    type: 'downloads';
    title: string;
    files: { id: string, title: string; fileUrl: string }[];
}


export type MicrositeBlock =
    | HeroBlock | AboutBlock | ServicesBlock | TeamBlock | TestimonialsBlock | FaqBlock | ContactBlock
    | NewsBlock | AwardsBlock | CertificatesBlock | PolicyHighlightsBlock | LocationBlock | VideoBlock | DownloadsBlock;


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