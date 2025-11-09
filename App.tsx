import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadGeneration from './pages/LeadGeneration';
import MicroCRM from './pages/MicroCRM';
import CustomerMicrosite from './pages/CustomerMicrosite';
import GapAnalysis from './pages/GapAnalysis';
import SocialComposer from './pages/SocialComposer';
import AdCampaigns from './pages/AdCampaigns';
import Analytics from './pages/Analytics';
import Onboarding from './pages/Onboarding';
import Billing from './pages/Billing';
import MicrositeBuilder from './pages/MicrositeBuilder';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Logout from './pages/Logout';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './context/LanguageContext';
import GTMProvider from './components/GTMProvider';
import RouteAnalyticsTracker from './components/RouteAnalyticsTracker';
import LeadCapturePage from './pages/LeadCapturePage';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <GTMProvider>
          <Router>
            <RouteAnalyticsTracker />
            <Routes>
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/lead-generation" element={<Layout><LeadGeneration /></Layout>} />
              <Route path="/micro-crm" element={<Layout><MicroCRM /></Layout>} />
              <Route path="/customer/:id" element={<Layout><CustomerMicrosite /></Layout>} />
              <Route path="/gap-analysis" element={<Layout><GapAnalysis /></Layout>} />
              <Route path="/social-composer" element={<Layout><SocialComposer /></Layout>} />
              <Route path="/ad-campaigns" element={<Layout><AdCampaigns /></Layout>} />
              <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
              <Route path="/onboarding" element={<Layout><Onboarding /></Layout>} />
              <Route path="/billing" element={<Layout><Billing /></Layout>} />
              <Route path="/microsite-builder" element={<Layout><MicrositeBuilder /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              <Route path="/logout" element={<Layout><Logout /></Layout>} />
              <Route path="/capture/:campaignId" element={<LeadCapturePage />} />
            </Routes>
          </Router>
        </GTMProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;