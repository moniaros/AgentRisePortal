import React from 'react';
// FIX: Correct import path
import { SocialPlatform } from './types';

// Placeholder icons. In a real app, these would be SVG components.
const PlaceholderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MagicWandIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.475 2.475-3 3 0 0 0 1.128 5.78A3 3 0 0 0 8.47 19.532a2.25 2.25 0 0 1 2.475-2.475Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.382 15.382 2.25-2.25 1.125-1.125a2.25 2.25 0 0 0-3.182-3.182L12 12.012a2.25 2.25 0 0 0-3.182 3.182L15.382 15.382Z" />
    </svg>
);

const NewsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 18V6.375c0-.621.504-1.125 1.125-1.125H9.375m3 7.5H12m-3-7.5h.008v.008H9V7.5Z" />
    </svg>
);

const TestimonialsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
);

const AutomationIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 00-3.375-3.375H8.25a3.375 3.375 0 00-3.375 3.375v3.192m3.375 2.691c-1.682 0-3.045.383-4.148 1.004M13.5 14.25c-1.682 0-3.045.383-4.148 1.004M13.5 14.25v.75m0-.75l1.68-1.68m-1.68 1.68v.75m0-.75l-1.68-1.68m0 0v.75m0-.75l-1.68 1.68m0 0v.75m0-.75l-1.68-1.68" />
    </svg>
);

const SupportIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
);

const ProfileIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);


export const ICONS: { [key: string]: React.ReactElement<React.SVGProps<SVGSVGElement>> } = {
  dashboard: <PlaceholderIcon />,
  leadGen: <PlaceholderIcon />,
  crm: <PlaceholderIcon />,
  gapAnalysis: <PlaceholderIcon />,
  onboarding: <PlaceholderIcon />,
  billing: <PlaceholderIcon />,
  micrositeBuilder: <PlaceholderIcon />,
  socialComposer: <PlaceholderIcon />,
  campaigns: <PlaceholderIcon />,
  analytics: <PlaceholderIcon />,
  settings: <PlaceholderIcon />,
  logout: <PlaceholderIcon />,
  magic: <MagicWandIcon />,
  news: <NewsIcon />,
  testimonials: <TestimonialsIcon />,
  automation: <AutomationIcon />,
  support: <SupportIcon />,
  profile: <ProfileIcon />,
};


// Social Platform Icons & Definitions
// FIX: Update icon components to accept SVG props to resolve cloneElement type error.
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.41 0 22.675 0z" /></svg>;
// FIX: Update icon components to accept SVG props to resolve cloneElement type error.
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85c.148-3.225 1.664 4.771 4.919-4.919 1.266-.058 1.644.07 4.85.07m0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98C15.667 0 15.259 0 12 0z" /><path d="M12 6.848c-2.832 0-5.152 2.32-5.152 5.152s2.32 5.152 5.152 5.152 5.152-2.32 5.152-5.152-2.32-5.152-5.152-5.152zm0 8.302c-1.743 0-3.15-1.407-3.15-3.15s1.407-3.15 3.15-3.15 3.15 1.407 3.15 3.15-1.407 3.15-3.15 3.15z" /><path d="M16.949 5.255a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z" /></svg>;
// FIX: Update icon components to accept SVG props to resolve cloneElement type error.
const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
// FIX: Update icon components to accept SVG props to resolve cloneElement type error.
const XIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} className="w-6 h-6 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
    { key: 'facebook', name: 'Facebook', icon: <FacebookIcon /> },
    { key: 'instagram', name: 'Instagram', icon: <InstagramIcon /> },
    { key: 'linkedin', name: 'LinkedIn', icon: <LinkedInIcon /> },
    { key: 'x', name: 'X', icon: <XIcon /> },
];