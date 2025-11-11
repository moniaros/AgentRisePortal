// types.ts

// Basic types
export enum Language {
  EN = 'en',
  EL = 'el',
}

export type TranslationTokens = { [key: string]: any };

// User & Auth
export enum UserSystemRole {
  ADMIN = 'admin',
  AGENT = 'agent',
}

export interface AcordLicense {
    type: string;
    licenseNumber: string;
    expirationDate: string;
    status: LicenseStatus;
}

export type LicenseStatus = 'valid' | 'expired' | 'pending_review';

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
    signature?: string;
  };
  partyRole: {
    roleType: UserSystemRole;
    roleTitle: string;
    permissionsScope: 'agency' | 'global';
    jobTitle?: string;
    department?: string;
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

export interface Coverage {
  type: string;
  limit: string;
  deductible?: string;
  premium?: number;
}

export interface VehicleACORD {
    make: string;
    model: string;
    year: number;
    vin: string;
}
export interface InsuredPartyACORD {
    name: string;
    address: string;
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
    size: number; // in bytes
    url: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'note' | 'call' | 'email' | 'meeting' | 'system' | 'policy_update' | 'claim';
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
  source: string;
  status: LeadStatus;
  potentialValue: number;
  createdAt: string;
  policyType: PolicyType;
  agencyId: string;
  score?: number;
  customerId?: string;
  campaignId?: string;
}

// Social & Campaigns
export interface SocialPlatform {
  key: string;
  name: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

export enum CampaignObjective {
  LEAD_GENERATION = 'LEAD_GENERATION',
  BRAND_AWARENESS = 'BRAND_AWARENESS',
  WEBSITE_TRAFFIC = 'WEBSITE_TRAFFIC',
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
  agencyId: string;
  leadCaptureForm?: {
      fields: LeadCaptureFormField[];
  }
}

// Gap Analysis
export interface DetailedPolicy {
  policyNumber: string;
  insurer: string;
  policyholder: {
    name: string;
    address: string;
  };
  effectiveDate?: string;
  expirationDate?: string;
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

// Admin & Logs
export type UserActivityType = 'login' | 'action' | 'notification';

export interface UserActivityEvent {
    id: string;
    userId: string;
    timestamp: string;
    type: UserActivityType;
    description: string;
    details?: {
        ipAddress?: string;
        targetId?: string;
    };
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

// Analytics
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

// Onboarding
export interface OnboardingProgress {
  profileCompleted: boolean;
  policyAnalyzed: boolean;
  campaignCreated: boolean;
}

// News & Testimonials
export interface NewsArticle {
    id: string;
    title: string;
    summary: string;
    content: string;
    author: {
        name: string;
        avatarUrl?: string;
    };
    publishedDate: string;
    tags: string[];
    imageUrl: string;
    seo: {
        title: string;
        description: string;
    };
    agencyId: 'global' | string;
}

export interface Testimonial {
    id: string;
    authorName: string;
    authorPhotoUrl?: string;
    quote: string;
    rating: number;
    status: 'pending' | 'approved' | 'rejected';
    agencyId: string;
    createdAt: string;
}

// Microsite Builder
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
  imageUrl?: string;
}

export interface AboutBlock extends BaseBlock {
  type: 'about';
  title: string;
  content: string;
  imageUrl?: string;
}

export interface ServicesBlock extends BaseBlock {
    type: 'services';
    title: string;
    services: { id: string, name: string; description: string; icon: string }[];
}

export interface TeamBlock extends BaseBlock {
    type: 'team';
    title: string;
    members: { id: string, name: string, role: string, imageUrl: string }[];
}

export interface TestimonialsBlock extends BaseBlock {
    type: 'testimonials';
    title: string;
    testimonials: { id: string, quote: string, author: string }[];
}

export interface FaqBlock extends BaseBlock {
    type: 'faq';
    title: string;
    items: { id: string, question: string, answer: string }[];
}

export interface ContactBlock extends BaseBlock {
    type: 'contact';
    title: string;
    subtitle: string;
}
export interface NewsBlock extends BaseBlock {
    type: 'news';
    title: string;
    items: { id: string, title: string, summary: string, date: string }[];
}

export interface AwardsBlock extends BaseBlock {
    type: 'awards';
    title: string;
    awards: { id: string, title: string, issuer: string, year: string }[];
}
export interface CertificatesBlock extends BaseBlock {
    type: 'certificates';
    title: string;
    certificates: { id: string, name: string, imageUrl: string }[];
}
export interface PolicyHighlightsBlock extends BaseBlock {
    type: 'policy_highlights';
    title: string;
    highlights: { id: string, title: string, description: string }[];
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
    files: { id: string, title: string, fileUrl: string }[];
}


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

// GBP (Google Business Profile)
export interface GbpLocationSummary {
    title: string;
    averageRating: number;
    totalReviewCount: number;
}

export type GbpStarRating = 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';

export interface GbpReview {
    name: string; // The unique ID for the review
    reviewer: {
        displayName: string;
        profilePhotoUrl: string;
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

// Automation
export type RuleCategory = 'lead_conversion' | 'communication_automation';
export type TriggerType = 'on_lead_creation' | 'on_status_change';
export type ConditionField = 'lead_status' | 'lead_score' | 'policy_interest';
export type ConditionOperator = 'is' | 'is_not' | 'equals' | 'greater_than' | 'less_than';
export type ActionType = 'send_email' | 'send_sms' | 'send_viber' | 'send_whatsapp';

export interface RuleCondition {
    id: string;
    field: ConditionField;
    operator: ConditionOperator;
    value: string | number;
}

export interface RuleAction {
    id: string;
    type: ActionType;
    templateId: string;
}

export interface AutomationRule {
    id: string;
    name: string;
    description: string;
    category: RuleCategory;
    triggerType: TriggerType;
    conditions: RuleCondition[];
    actions: RuleAction[];
    isEnabled: boolean;
    agencyId: string;
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

export interface AutomationEvent {
    id: string;
    ruleId: string;
    ruleName: string;
    timestamp: string;
    status: 'success' | 'failure';
    details: string;
    impact?: string;
    leadId: string;
    agencyId: string;
    channel?: TemplateChannel;
}

export interface AutomationAnalytics {
    conversionRateBefore: number;
    conversionRateAfter: number;
    messagesSentByChannel: {
        channel: TemplateChannel;
        count: number;
    }[];
}

export interface AutomationChannelSettings {
    email: {
        isEnabled: boolean;
        host?: string;
        port?: number;
        username?: string;
        password?: string;
        fromAddress?: string;
    };
    viber: {
        isEnabled: boolean;
        apiKey?: string;
        senderName?: string;
    };
    whatsapp: {
        isEnabled: boolean;
        apiKey?: string;
        phoneNumberId?: string;
    };
    sms: {
        isEnabled: boolean;
        apiKey?: string;
        apiSecret?: string;
        senderId?: string;
    }
}

// Simulation for Rule Builder
export interface ConditionResult {
    condition: RuleCondition;
    passed: boolean;
    actualValue: any;
}
export interface SimulationResult {
    conditionsMet: boolean;
    conditionResults: ConditionResult[];
}

// ACORD & Data Sync
export interface CoverageDetailACORD {
    type: string;
    limit: string;
    deductible?: string;
    premium?: number;
}
export interface PolicyACORD {
    id: string;
    policyNumber: string;
    insurer: { name: string };
    policyholder: InsuredPartyACORD;
    effectiveDate: string;
    expirationDate: string;
    coverages: CoverageDetailACORD[];
    totalPremium: number;
    lastUpdated: string;
    beneficiaries: InsuredPartyACORD[];
    vehicle?: VehicleACORD;
}

export interface StoredAnalysis {
    id: string;
    fileName: string;
    createdAt: string;
    parsedPolicy: DetailedPolicy;
    analysisResult: GapAnalysisResult;
}

// Extended types from mock JSON files
export interface TransactionInquiry {
    id: string;
    createdAt: string;
    agencyId: string;
    // ... other fields
}

export interface Opportunity__EXT {
    id: string;
    nextFollowUpDate: string;
    stage: 'prospecting' | 'quoting' | 'negotiation' | 'won' | 'lost';
    value: number;
    agencyId: string;
    // ... other fields
}

export interface Interaction {
    id: string;
    direction: 'inbound' | 'outbound';
    read: boolean;
    agencyId: string;
    // ... other fields
}

export interface FirstNoticeOfLoss {
    id: string;
    createdAt: string;
    agencyId: string;
    // ... other fields
}

export interface ServiceRequest {
    id: string;
    createdAt: string;
    agencyId: string;
    // ... other fields
}

export interface PerfSample {
    date: string;
    spend: number;
    conversions: {
        lead: number;
    };
    agencyId: string;
    // ... other fields
}

export interface PortalAccount__EXT {
    id: string;
    lastLoginAt: string;
    agencyId: string;
    // ... other fields
}

export interface KPISnapshot {
    date: string;
    agencyId: string;
    source: string;
    won: {
        count: number;
        gwp: number;
    };
    avgTimeToFirstReplyH?: number;
    // ... other fields
}

export interface FunnelRun {
    date: string;
    leads: number;
    pageviews: number;
    agencyId: string;
}

export interface Conversion {
    date: string;
    kind: 'lead' | 'other';
    utm_source: string;
    utm_campaign: string;
    agencyId: string;
}
