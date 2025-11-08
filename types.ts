// types.ts

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
}

export interface Policy {
    id: string;
    type: PolicyType;
    policyNumber: string;
    insurer: string;
    premium: number;
    startDate: string; // ISO 8601 format
    endDate: string; // ISO 8601 format
    isActive: boolean;
}

export interface TimelineEvent {
    id: string;
    date: string; // ISO 8601 format
    type: 'note' | 'call' | 'email' | 'meeting' | 'policy_update' | 'policy_renewal' | 'premium_reminder' | 'address_change' | 'ai_review';
    title: string;
    content: string;
    author: string; // e.g., 'Agent Name' or 'System'
}


export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string; // ISO 8601 format
    policies: Policy[];
    timeline: TimelineEvent[];
}


export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    source: string; // e.g., 'Facebook', 'Website Form', 'Referral'
    status: 'new' | 'contacted' | 'qualified' | 'rejected' | 'closed';
    potentialValue: number;
    policyType: PolicyType;
    createdAt: string; // ISO 8601 format
    customerId?: string; // Link to a customer profile if converted
}

// Microsite Builder Types
export type BlockType = 'productInfo' | 'cta' | 'form';

export interface BilingualText {
    en: string;
    el: string;
}

export interface ProductInfoBlock {
    id: string;
    type: 'productInfo';
    title: BilingualText;
    content: BilingualText;
}

export interface CtaBlock {
    id:string;
    type: 'cta';
    text: BilingualText;
}

export interface FormBlock {
    id: string;
    type: 'form';
    title: BilingualText;
}

export type MicrositeBlock = ProductInfoBlock | CtaBlock | FormBlock;

export interface MicrositeConfig {
    blocks: MicrositeBlock[];
}
