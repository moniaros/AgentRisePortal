// This file centralizes all type definitions for the application.
// FIX: Import ReactElement to resolve "Cannot find namespace 'React'" error.
import type { ReactElement } from 'react';

// ========== Enums ==========

export enum Language {
    EN = 'en',
    EL = 'el',
}

export enum UserSystemRole {
    AGENT = 'agent',
    ADMIN = 'admin',
}

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

export enum CampaignObjective {
    LEAD_GENERATION = 'lead_generation',
    BRAND_AWARENESS = 'brand_awareness',
}

export type LicenseStatus = 'valid' | 'expired' | 'pending_review';
export type UserActivityType = 'login' | 'action' | 'notification';
export type RuleCategory = 'lead_conversion' | 'communication_automation';
export type ConditionField = 'lead_status' | 'lead_score' | 'policy_interest';
export type ConditionOperator = 'is' | 'is_not' | 'equals' | 'greater_than' | 'less_than';
export type ActionType = 'send_email' | 'send_sms' | 'send_viber' | 'send_whatsapp';
export type TemplateChannel = 'email' | 'sms' | 'viber' | 'whatsapp';


// ========== Core Data Structures ==========

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
    fullAddress?: string;
}

export interface Party {
    partyName: PartyName;
    contactInfo: ContactInfo;
    addressInfo?: AddressInfo;
    profilePhotoUrl?: string;
    signature?: string; // Data URL
}

export interface AcordLicense {
    type: string;
    licenseNumber: string;
    expirationDate: string;
    status: LicenseStatus;
}

export interface PartyRole {
    roleType: UserSystemRole;
    roleTitle: string;
    permissionsScope: 'agency' | 'global';
    jobTitle?: string;
    department?: string;
    licenses?: AcordLicense[];
}

export interface User {
    id: string;
    agencyId: string;
    party: Party;
    partyRole: PartyRole;
}

export interface Coverage {
    type: string;
    limit: string;
    deductible?: string;
    premium?: number;
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
    vehicle?: VehicleACORD;
    beneficiaries?: InsuredPartyACORD[];
}

export interface Annotation {
    id: string;
    date: string;
    author: string;
    content: string;
}

export interface Attachment {
    name: string;
    url: string;
    size: number;
}

export interface TimelineEvent {
    id: string;
    date: string;
    type: 'note' | 'call' | 'email' | 'meeting' | 'policy_update' | 'claim' | 'system';
    content: string;
    author: string;
    isFlagged?: boolean;
    annotations?: Annotation[];
    attachments?: Attachment[];
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
    communicationPreferences?: Array<'email' | 'sms'>;
    attentionFlag?: string;
    policies: Policy[];
    timeline: TimelineEvent[];
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
    potentialValue: number;
    createdAt: string;
    customerId?: string;
    policyType: PolicyType;
    score?: number;
    campaignId?: string;
}

// ========== Google Business Profile ==========

export type GbpStarRating = 'STAR_RATING_UNSPECIFIED' | 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';

export interface GbpReview {
    name: string;
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

export interface GbpLocationSummary {
    title: string;
    averageRating: number;
    totalReviewCount: number;
}

// ========== Translation & UI ==========

export interface TranslationTokens {
    [key: string]: string | TranslationTokens;
}

export interface SocialPlatform {
    key: string;
    name: string;
    icon: ReactElement;
}

// ========== Gap Analysis & AI ==========

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
    gaps: { area: string; current: string; recommended: string; reason: string }[];
    upsell_opportunities: { product: string; recommendation: string; benefit: string }[];
    cross_sell_opportunities: { product: string; recommendation: string; benefit: string }[];
}

export interface StoredAnalysis {
    id: string;
    createdAt: string;
    fileName: string;
    parsedPolicy: DetailedPolicy;
    analysisResult: GapAnalysisResult;
}

// ========== Campaigns ==========

export interface Campaign {
    id: string;
    agencyId: string;
    name: string;
    objective: CampaignObjective;
    network: 'facebook' | 'instagram' | 'linkedin';
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
    leadCaptureForm?: LeadCaptureForm;
}

export interface LeadCaptureForm {
    fields: LeadCaptureFormField[];
}

export interface LeadCaptureFormField {
    name: string;
    type: 'text' | 'email' | 'tel' | 'number';
    required: boolean;
}

// ========== Analytics ==========

export interface AnalyticsRecord {
    date: string;
    campaignId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}

export type AnalyticsData = AnalyticsRecord[];

// ========== Executive Dashboard ==========

export interface ExecutiveData {
    agencyGrowth: { month: string; premium: number; policies: number }[];
    productMix: { name: PolicyType; value: number }[];
    claimsTrend: { month: string; submitted: number; approved: number; paid: number }[];
    leadFunnel: { status: LeadStatus; count: number }[];
    campaignRoi: { id: string; name: string; spend: number; revenue: number }[];
    riskExposure: { area: string; exposure: number; mitigation: number }[];
}

// ========== Onboarding ==========
export interface OnboardingProgress {
    profileCompleted: boolean;
    policyAnalyzed: boolean;
    campaignCreated: boolean;
}

// ========== User Management ==========
export interface UserActivityEvent {
    id: string;
    userId: string;
    agencyId: string;
    timestamp: string;
    type: UserActivityType;
    description: string;
    details?: Record<string, any>;
}

export interface AuditLog {
    id: string;
    agencyId: string;
    timestamp: string;
    actorName: string;
    action: 'user_invited' | 'user_removed' | 'role_changed';
    targetName: string;
    details: string;
}

// ========== Microsite Builder ==========

export type BlockType = 'hero' | 'about' | 'services' | 'team' | 'testimonials' | 'faq' | 'contact' | 'news' | 'awards' | 'certificates' | 'policy_highlights' | 'location' | 'video' | 'downloads';

interface BlockBase { id: string; type: BlockType; }
export interface HeroBlock extends BlockBase { type: 'hero'; title: string; subtitle: string; ctaText: string; imageUrl: string; }
export interface AboutBlock extends BlockBase { type: 'about'; title: string; content: string; imageUrl: string; }
export interface ServicesBlock extends BlockBase { type: 'services'; title: string; services: { id: string; name: string; description: string; icon: string }[]; }
export interface TeamBlock extends BlockBase { type: 'team'; title: string; members: { id: string; name: string; role: string; imageUrl: string }[]; }
export interface TestimonialsBlock extends BlockBase { type: 'testimonials'; title: string; testimonials: { id: string; quote: string; author: string }[]; }
export interface FaqBlock extends BlockBase { type: 'faq'; title: string; items: { id: string; question: string; answer: string }[]; }
export interface ContactBlock extends BlockBase { type: 'contact'; title: string; subtitle: string; }
export interface NewsBlock extends BlockBase { type: 'news', title: string; items: { id: string, title: string, summary: string, date: string }[] }
export interface AwardsBlock extends BlockBase { type: 'awards', title: string; awards: { id: string, title: string, issuer: string, year: string }[] }
export interface CertificatesBlock extends BlockBase { type: 'certificates', title: string; certificates: { id: string, name: string, imageUrl: string }[] }
export interface PolicyHighlightsBlock extends BlockBase { type: 'policy_highlights', title: string; highlights: { id: string, title: string, description: string }[] }
export interface LocationBlock extends BlockBase { type: 'location', title: string; address: string; googleMapsUrl: string; }
export interface VideoBlock extends BlockBase { type: 'video', title: string; youtubeVideoId: string; }
export interface DownloadsBlock extends BlockBase { type: 'downloads', title: string; files: { id: string, title: string, fileUrl: string }[] }

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

// ========== Content (News, Testimonials) ==========

export interface NewsArticle {
    id: string;
    agencyId: 'global' | string;
    title: string;
    summary: string;
    content: string; // HTML content
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
}

export interface Testimonial {
    id: string;
    agencyId: string;
    authorName: string;
    authorPhotoUrl?: string;
    quote: string;
    rating: number;
    status: 'approved' | 'pending' | 'rejected';
    createdAt: string;
}

// ========== Automation Rules ==========
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

export interface MessageTemplate {
    id: string;
    name: string;
    channel: TemplateChannel;
    content: string;
}

export interface ConditionResult {
    condition: RuleCondition;
    passed: boolean;
    actualValue: any;
}

export interface SimulationResult {
    conditionsMet: boolean;
    conditionResults: ConditionResult[];
}

// ========== ACORD-like Structures for Policy Sync ==========

export interface VehicleACORD {
    vin: string;
    make: string;
    model: string;
    year: number;
}

export interface InsuredPartyACORD {
    name: string;
    address: string;
}

export interface CoverageDetailACORD {
    type: string;
    limit: string;
    deductible?: string;
    premium?: number;
}

export interface PolicyACORD {
    id: string;
    policyNumber: string;
    insurer: { name: string; };
    policyholder: InsuredPartyACORD;
    effectiveDate: string;
    expirationDate: string;
    coverages: CoverageDetailACORD[];
    totalPremium: number;
    lastUpdated: string;
    vehicle?: VehicleACORD;
    beneficiaries: InsuredPartyACORD[];
}

// ========== External Data Sources (Dashboard) ==========
export interface TransactionInquiry { id: string; agencyId: string; createdAt: string; }
export interface Opportunity__EXT { id: string; agencyId: string; nextFollowUpDate: string; stage: string; value: number; }
export interface Interaction { id: string; agencyId: string; direction: 'inbound' | 'outbound'; read: boolean; }
export interface FirstNoticeOfLoss { id: string; agencyId: string; createdAt: string; }
export interface ServiceRequest { id: string; agencyId: string; createdAt: string; }
export interface PerfSample { date: string; agencyId: string; spend: number; conversions: { lead: number } }
export interface PortalAccount__EXT { id: string; agencyId: string; lastLoginAt: string; }
export interface KPISnapshot { date: string; agencyId: string; source: string; won: { count: number; gwp: number }; avgTimeToFirstReplyH?: number; }
export interface Conversion { date: string; kind: 'lead'; utm_source: string; utm_campaign: string; }
export interface FunnelRun { date: string; pageviews: number; leads: number; }

// Automation Settings
export interface ChannelConfig {
    isEnabled: boolean;
    [key: string]: any;
}
export interface AutomationChannelSettings {
    email: ChannelConfig & { host?: string; port?: number; username?: string; password?: string; fromAddress?: string };
    viber: ChannelConfig & { apiKey?: string; senderName?: string; };
    whatsapp: ChannelConfig & { apiKey?: string; phoneNumberId?: string; };
    sms: ChannelConfig & { apiKey?: string; apiSecret?: string; senderId?: string; };
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
    messagesSentByChannel: { name: string; value: number }[];
}

// ========== Settings ==========
export interface SocialConnection {
    isConnected: boolean;
    accountName?: string;
    profileUrl?: string;
}

export type SocialConnections = Record<string, SocialConnection>;
