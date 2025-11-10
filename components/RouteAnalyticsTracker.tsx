// FIX: Add import for React to resolve 'React.FC' type.
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analytics';
import { useLocalization } from '../hooks/useLocalization';

/**
 * This component tracks page views whenever the route changes and
 * pushes the event to the data layer for GTM.
 */
const RouteAnalyticsTracker: React.FC = () => {
  const location = useLocation();
  const { language } = useLocalization();

  useEffect(() => {
    // We use the pathname and search params to represent the page view
    const pagePath = location.pathname + location.search;
    trackPageView(pagePath, language);
  }, [location, language]);

  return null; // This component does not render anything
};

export default RouteAnalyticsTracker;
