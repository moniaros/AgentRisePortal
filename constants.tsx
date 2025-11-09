
import React from 'react';

// Placeholder icons. In a real app, these would be SVG components.
const PlaceholderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// FIX: Update the type of ICONS to allow passing SVG props like className.
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
};
