
// FIX: Import React to resolve 'Cannot find namespace React' error.
import React from 'react';

// Basic types
export enum Language {
  EN = 'en',
  EL = 'el',
}

export type TranslationTokens = { [key: string]: string | TranslationTokens };

// User and Auth
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
  expirationDate: string;
  status: LicenseStatus;
}

export interface User {
  id: string;
  agencyId: string;
  party: {
    partyName: {
      firstName: string;
      lastName: string;
    };
    contactInfo: {
      email: string;
      workPhone?: string;
      mobilePhone?: string;
    };
    addressInfo?: {
      fullAddress: string;
    };
    profilePhotoUrl?: string;
    signature?: string; // Base64 image
  };
  partyRole: {
    roleType: UserSystemRole;
    roleTitle: string;
    jobTitle?: string;
    department?: string;
    permissionsScope: 'agency' | 'global';
    licenses?: AcordLicense[];
  };
}

// CRM types
export enum PolicyType {
  AUTO = 'auto',
  HOME = 'home',
  LIFE = 'life',
  HEALTH = 'health',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

export interface Coverage {
  type: string;
  limit: string;
  deductible?: string;
  premium?: number;
}

export interface InsuredPartyACORD {
  name: string;
  address: string;
}

export interface VehicleACORD {
  make: string;
  model: string;
  year: number;
  vin: string;
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
  beneficiaries?: InsuredPartyACORD[];
  vehicle?: VehicleACORD;
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
  author: string;
  content: string;
  annotations?: Annotation[];
  attachments?: Attachment[];
  isFlagged?: boolean;
}

export interface ConsentInfo {
  isGiven: boolean;
  dateGranted: string | null; // ISO Date string yyyy-mm-dd
  channel: 'email' | 'sms' | 'phone' | 'web_form' | 'in_person' | null;
}

export interface Customer {
  id: string;
  agencyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  policies: Policy[];
  timeline: TimelineEvent[];
  attentionFlag?: string;
  communicationPreferences?: ('email' | 'sms')[];
  consent?: {
    gdpr: ConsentInfo;
    marketing: ConsentInfo;
  };
}

export interface Lead {
  id: string;
  agencyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
  potentialValue: number;
  policyType: PolicyType;
  campaignId?: string;
  customerId?: string; // Link to a customer profile if converted
  score?: number;
}

export interface Task {
  id: string;
  agencyId: string;
  agentId: string;
  title: string;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  relatedTo?: {
    type: 'customer' | 'opportunity' | 'lead';
    id: string;
    name: string;
  };
}

// GBP types
export type GbpStarRating = 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';

export interface GbpLocationSummary {
    title: string;
    averageRating: number;
    totalReviewCount: number;
}
export interface GbpReview {
    name: string; // e.g. "reviews/123"
    reviewer: {
        displayName: string;
    };
    starRating: GbpStarRating;
    comment: string;
    createTime: string;
    updateTime: string;
    reply?: {
        comment: string;
        updateTime: string;
    };
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
    effectiveDate?: string;
    expirationDate?: string;
}

export interface GapAnalysisResult {
    riskScore: number; // 0-100, where 100 is high risk
    summary: string;
    gaps: {
        area: string;
        current: string;
        recommended: string;
        reason: string;
        priority: 'Critical' | 'High' | 'Medium' | 'Low';
        financialImpact: string; // e.g., "Potential €50k loss"
        costOfInaction: string; // e.g., "Risk of bankruptcy"
        salesScript: string; // e.g., "Mr. Smith, if this happens..."
    }[];
    upsell_opportunities: {
        product: string;
        recommendation: string;
        benefit: string;
        priority: 'High' | 'Medium' | 'Low';
        financialImpact: string;
        salesScript: string;
    }[];
    cross_sell_opportunities: {
        product: string;
        recommendation: string;
        benefit: string;
        priority: 'High' | 'Medium' | 'Low';
        financialImpact: string;
        salesScript: string;
    }[];
}

export interface StoredAnalysis {
    id: string;
    createdAt: string;
    fileName: string;
    parsedPolicy: DetailedPolicy;
    analysisResult: GapAnalysisResult;
}

// AI Findings & Opportunities
export type FindingStatus = 'pending_review' | 'verified' | 'dismissed';
export type FindingType = 'gap' | 'upsell' | 'cross-sell';

export interface StoredFinding {
    id: string;
    customerId: string;
    agencyId: string;
    createdAt: string;
    type: FindingType;
    status: FindingStatus;
    title: string; // e.g., "Increased Liability Coverage" or "Umbrella Policy"
    description: string; // The reason/recommendation
    benefit?: string; // Specific customer benefit
    originalAnalysisId: string;
}


// User Management & Audit
export interface AuditLog {
    id: string;
    agencyId: string;
    timestamp: string;
    actorName: string;
    action: 'user_invited' | 'user_removed' | 'role_changed';
    targetName: string;
    details: string;
}
export type UserActivityType = 'login' | 'action' | 'notification';
export interface UserActivityEvent {
    id: string;
    userId: string;
    timestamp: string;
    type: UserActivityType;
    description: string;
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
  SALES = 'sales',
}
export interface LeadCaptureFormField {
    name: string;
    type: 'text' | 'email' | 'tel' | 'number';
    required: boolean;
}
export interface Campaign {
    id: string;
    agencyId: string;
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
    status: 'draft' | 'active' | 'completed';
    leadCaptureForm?: {
        fields: LeadCaptureFormField[];
    }
}
export interface AnalyticsRecord {
    date: string; // YYYY-MM-DD
    campaignId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}
export type AnalyticsData = AnalyticsRecord[];

// Executive Dashboard
export interface ExecutiveData {
  agencyGrowth: { month: string; premium: number; policies: number }[];
  productMix: { name: PolicyType; value: number }[];
  claimsTrend: { month: string; submitted: number; approved: number; paid: number }[];
  leadFunnel: { status: LeadStatus; count: number }[];
  campaignRoi: { id: string; name: string; spend: number; revenue: number; }[];
  riskExposure: { area: string; exposure: number; mitigation: number }[];
}

// FIX: Added missing NewsArticle and Testimonial types.
// News & Content
export interface NewsArticle {
    id: string;
    agencyId: string;
    title: string;
    summary: string;
    content: string;
    imageUrl: string;
    publishedDate: string;
    author: {
        name: string;
        avatarUrl: string;
    };
    tags: string[];
    seo: {
        title: string;
        description: string;
    };
}

export interface Testimonial {
    id: string;
    agencyId: string;
    authorName: string;
    quote: string;
    rating: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    authorPhotoUrl: string;
}

export interface KPISnapshot {
  id: string;
  date: string;
  agencyId: string;
  source: string;
  won: {
    count: number;
    gwp: number;
  };
  avgTimeToFirstReplyH?: number;
}
export interface Conversion {
    id: string;
    date: string;
    kind: 'lead' | 'sale' | 'won'; // Added 'won' for pipeline
    utm_source?: string;
    utm_campaign?: string;
    attributionId?: string;
    value?: number;
}

export interface FunnelRun {
    id: string;
    date: string;
    pageviews: number;
    leads: number;
}

// ACORD-like types for policy storage
export interface CoverageDetailACORD {
    type: string;
    limit: string;
    deductible?: string;
    premium?: number;
}

export interface PolicyACORD {
    id: string;
    policyNumber: string;
    insurer: {
        name: string;
    };
    policyholder: InsuredPartyACORD;
    effectiveDate: string;
    expirationDate: string;
    coverages: CoverageDetailACORD[];
    totalPremium: number;
    lastUpdated: string;
    beneficiaries: InsuredPartyACORD[];
    vehicle?: VehicleACORD;
}

// Microsite builder types
export type BlockType = 'hero' | 'about' | 'services' | 'team' | 'testimonials' | 'faq' | 'contact' | 'news' | 'awards' | 'certificates' | 'policy_highlights' | 'location' | 'video' | 'downloads';
export interface HeroBlock { id: string; type: 'hero'; title: string; subtitle: string; ctaText: string; imageUrl: string; }
export interface AboutBlock { id: string; type: 'about'; title: string; content: string; imageUrl: string; }
export interface ServiceItem { id: string; name: string; description: string; icon: string; }
export interface ServicesBlock { id: string; type: 'services'; title: string; services: ServiceItem[]; }
export interface TeamMember { id: string; name: string; role: string; imageUrl: string; }
export interface TeamBlock { id: string; type: 'team'; title: string; members: TeamMember[]; }
export interface TestimonialItem { id: string; quote: string; author: string; }
export interface TestimonialsBlock { id: string; type: 'testimonials'; title: string; testimonials: TestimonialItem[]; }
export interface FaqItem { id: string; question: string; answer: string; }
export interface FaqBlock { id: string; type: 'faq'; title: string; items: FaqItem[]; }
export interface ContactBlock { id: string; type: 'contact'; title: string; subtitle: string; }
export interface NewsItem { id: string; title: string; summary: string; date: string; }
export interface NewsBlock { id: string; type: 'news'; title: string; items: NewsItem[]; }
export interface AwardItem { id: string; title: string; issuer: string; year: string; }
export interface AwardsBlock { id: string; type: 'awards'; title: string; awards: AwardItem[]; }
export interface CertificateItem { id: string; name: string; imageUrl: string; }
export interface CertificatesBlock { id: string; type: 'certificates'; title: string; certificates: CertificateItem[]; }
export interface PolicyHighlightItem { id: string; title: string; description: string; }
export interface PolicyHighlightsBlock { id: string; type: 'policy_highlights'; title: string; highlights: PolicyHighlightItem[]; }
export interface LocationBlock { id: string; type: 'location'; title: string; address: string; googleMapsUrl: string; }
export interface VideoBlock { id: string; type: 'video'; title: string; youtubeVideoId: string; }
export interface DownloadItem { id: string; title: string; fileUrl: string; }
export interface DownloadsBlock { id: string; type: 'downloads'; title: string; files: DownloadItem[]; }
export type MicrositeBlock = HeroBlock | AboutBlock | ServicesBlock | TeamBlock | TestimonialsBlock | FaqBlock | ContactBlock | NewsBlock | AwardsBlock | CertificatesBlock | PolicyHighlightsBlock | LocationBlock | VideoBlock | DownloadsBlock;

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
// Automation Rules
export type RuleCategory = 'lead_conversion' | 'communication_automation';
export type ConditionField = 'lead_status' | 'lead_score' | 'policy_interest';
export type ConditionOperator = 'is' | 'is_not' | 'equals' | 'greater_than' | 'less_than';
export type ActionType = 'send_email' | 'send_sms' | 'send_viber' | 'send_whatsapp';

export interface RuleCondition {
    id: string;
    field: ConditionField;
    operator: ConditionOperator;
    value: any;
}

export interface RuleAction {
    id: string;
    type: ActionType;
    templateId: string;
}

export interface AutomationRule {
    id: string;
    agencyId: string;
    name: string;
    description: string;
    category: RuleCategory;
    triggerType: 'on_lead_creation' | 'on_status_change';
    conditions: RuleCondition[];
    actions: RuleAction[];
    isEnabled: boolean;
    lastExecuted: string | null;
    successRate: number;
}
export type TemplateChannel = 'email' | 'sms' | 'viber' | 'whatsapp';
export interface MessageTemplate {
    id: string;
    name: string;
    channel: TemplateChannel;
    content: string;
}
export interface AutomationChannelSettings {
    email: { isEnabled: boolean; host?: string; port?: number; username?: string; password?: string; fromAddress?: string; };
    viber: { isEnabled: boolean; apiKey?: string; senderName?: string; };
    whatsapp: { isEnabled: boolean; apiKey?: string; phoneNumberId?: string; };
    sms: { isEnabled: boolean; apiKey?: string; apiSecret?: string; senderId?: string; };
}
export interface AutomationEvent {
    id: string;
    agencyId: string;
    timestamp: string;
    ruleId: string;
    ruleName: string;
    status: 'success' | 'failure';
    details: string;
    impact?: string;
    channel?: TemplateChannel;
}
export interface AutomationAnalytics {
    conversionRateBefore: number;
    conversionRateAfter: number;
    messagesSentByChannel: { channel: TemplateChannel; count: number }[];
}
// For Rule Engine
export interface ConditionResult {
    condition: RuleCondition;
    passed: boolean;
    actualValue: any;
}
export interface SimulationResult {
    conditionsMet: boolean;
    conditionResults: ConditionResult[];
}
// Other Dashboard Data
// FIX: Removed duplicate/conflicting interface definitions for TransactionInquiry, Opportunity__EXT, and Interaction.
// The more detailed definitions are kept below.
export interface FirstNoticeOfLoss { id: string; agencyId: string; createdAt: string; }
export interface ServiceRequest { id: string; agencyId: string; createdAt: string; }
export interface PerfSample { id: string; date: string; agencyId: string; spend: number; conversions: { lead: number } }
export interface PortalAccount__EXT { id: string; agencyId: string; lastLoginAt: string; }

// Onboarding
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}

// Social Connections
export interface SocialConnection {
    isConnected: boolean;
    accountName?: string;
    profileUrl?: string;
}

export type SocialConnections = Record<'facebook' | 'instagram' | 'linkedin' | 'x', SocialConnection>;

// Sales Pipeline Types
export interface Prospect {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    agencyId: string;
}

export interface TransactionInquiry {
    id: string;
    agencyId: string;
    createdAt: string;
    contact: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    consentGDPR: boolean;
    source: string;
    purpose: 'general' | 'quote_request';
    attribution: {
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
    };
    attributionId: string;
}

export interface TransactionQuoteRequest {
    id: string;
    inquiryId: string;
    policyType: PolicyType;
    details: string;
}

export type OpportunityStage = 'new' | 'contacted' | 'proposal' | 'won' | 'lost';

export interface Opportunity__EXT {
    id: string;
    title: string;
    value: number; // premium
    prospectId: string;
    stage: OpportunityStage;
    nextFollowUpDate: string | null;
    agentId: string;
    agencyId: string;
    inquiryId: string; // link to original inquiry
    createdAt: string;
    updatedAt: string;
}

export interface Interaction {
    id: string;
    opportunityId: string;
    agentId: string;
    agencyId: string;
    channel: 'email' | 'sms' | 'viber' | 'call' | 'note';
    direction: 'inbound' | 'outbound';
    content: string;
    createdAt: string;
    // FIX: Added optional 'read' property to track message status.
    read?: boolean;
}
