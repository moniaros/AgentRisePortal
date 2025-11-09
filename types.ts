import React from 'react';

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

export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    source: string;
    status: 'new' | 'contacted' | 'qualified';
    potentialValue: number;
    createdAt: string; // ISO string
    policyType: PolicyType;
    customerId?: string;
    campaignId?: string;
    [key: string]: any; // For sorting
}

export interface Policy {
    id: string;
    type: PolicyType;
    policyNumber: string;
    insurer: string;
    premium: number;
    startDate: string;
    endDate: string;
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
    dateOfBirth: string;
    policies: Policy[];
    timeline: TimelineEvent[];
}

export enum CampaignObjective {
    LEAD_GENERATION = 'LEAD_GENERATION',
    WEBSITE_TRAFFIC = 'WEBSITE_TRAFFIC',
    BRAND_AWARENESS = 'BRAND_AWARENESS',
}

export interface Campaign {
    id: string;
    name: string;
    objective: CampaignObjective;
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
    // FIX: Renamed 'leadCapture' to 'leadCaptureForm' and updated its structure
    // to match usage in CampaignWizard and related components.
    leadCaptureForm?: {
        fields: {
            name: string;
            type: 'text' | 'email' | 'tel' | 'number';
            required: boolean;
        }[];
    }
}


export interface SocialPlatform {
    key: 'facebook' | 'instagram' | 'linkedin' | 'x';
    name: string;
    icon: React.ReactElement;
}