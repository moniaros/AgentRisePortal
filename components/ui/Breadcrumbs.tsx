import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLocalization } from '../../hooks/useLocalization';

// Maps the first segment of a URL path to the localization key of its parent menu
const BREADCRUMB_PARENT_MAP: Record<string, string> = {
    'executive-dashboard': 'nav.overview',
    'micro-crm': 'nav.crm',
    'customer': 'nav.crm',
    'gap-analysis': 'nav.crm',
    'leads-dashboard': 'nav.crm',
    'analytics': 'nav.campaigns',
    'social-composer': 'nav.campaigns',
    'ad-campaigns': 'nav.campaigns',
    'microsite-builder': 'nav.website',
    'news': 'nav.content',
    'testimonials': 'nav.content',
    'user-management': 'nav.management',
    'billing': 'nav.management',
    'support': 'nav.management',
    'profile': 'nav.settings',
    'settings': 'nav.settings',
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { t } = useLocalization();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Find the parent menu based on the first path segment
  const parentKey = pathnames.length > 0 ? BREADCRUMB_PARENT_MAP[pathnames[0]] : null;
  
  // Don't show breadcrumbs on the main dashboard
  if (pathnames.length === 0) {
      return null;
  }

  return (
    <nav aria-label="breadcrumb" className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
      <ol className="list-none p-0 inline-flex items-center">
        <li className="flex items-center">
          <Link to="/" className="hover:text-blue-500">Home</Link>
        </li>
        {parentKey && (
            <li className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-gray-700 dark:text-gray-200">{t(parentKey)}</span>
            </li>
        )}
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          // A simple way to make breadcrumb text more readable
          const label = value.match(/^\d+$/) ? `ID: ${value}` : value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
          
          return (
            <li key={to} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-gray-700 dark:text-gray-200">{label}</span>
              ) : (
                <Link to={to} className="hover:text-blue-500">{label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;