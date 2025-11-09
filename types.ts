import React from "react";

export enum Language {
    EN = 'en',
    EL = 'el',
}

export type TranslationTokens = {
    [key: string]: string | TranslationTokens;
};

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
    premium: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    insurer: string;
}

export interface TimelineEvent {
    id: string;
    date: string;
    type: 'call' | 'email' | 'meeting' | 'note' | 'policy_update' | 'policy_renewal' | 'premium_reminder' | 'address_change' | 'ai_review';
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
    dateOfBirth: string;
    policies: Policy[];
    timeline: TimelineEvent[];
}

export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    source: string;
    status: 'new' | 'contacted' | 'qualified' | 'closed' | 'rejected';
    policyType: PolicyType;
    potentialValue: number;
    createdAt: string;
    customerId?: string;
}

export interface SocialPlatform {
    key: string;
    name: string;
    icon: React.ReactElement;
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
    status: 'draft' | 'active' | 'completed';
    leadCaptureForm?: {
        fields: LeadCaptureFormField[];
    }
}

export interface CampaignPerformanceMetrics {
    date: string; // YYYY-MM-DD
    campaignId: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
}

export type AnalyticsData = CampaignPerformanceMetrics[];