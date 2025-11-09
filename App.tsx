
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadGeneration from './pages/LeadGeneration';
import MicroCRM from './pages/MicroCRM';
import CustomerMicrosite from './pages/CustomerMicrosite';
import GapAnalysis from './pages/GapAnalysis';
import Onboarding from './pages/Onboarding';
import Billing from './pages/Billing';
import SocialComposer from './pages/SocialComposer';
import AdCampaigns from './pages/AdCampaigns';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Logout from './pages/Logout';
import MicrositeBuilder from './pages/MicrositeBuilder';
import { LanguageProvider } from './context/LanguageContext';
import GTMProvider from './components/GTMProvider';
import ErrorBoundary from './components/ErrorBoundary';
import RouteAnalyticsTracker from './components/RouteAnalyticsTracker';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <GTMProvider>
          <Router>
            <RouteAnalyticsTracker />
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/lead-generation" element={<LeadGeneration />} />
                <Route path="/micro-crm" element={<MicroCRM />} />
                <Route path="/customer/:id" element={<CustomerMicrosite />} />
                <Route path="/gap-analysis" element={<GapAnalysis />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/social-composer" element={<SocialComposer />} />
                <Route path="/ad-campaigns" element={<AdCampaigns />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/microsite-builder" element={<MicrositeBuilder />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </GTMProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;