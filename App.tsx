import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import GTMProvider from './components/GTMProvider';
import RouteAnalyticsTracker from './components/RouteAnalyticsTracker';
import ErrorBoundary from './components/ErrorBoundary';

import Layout from './components/Layout';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Dashboard from './pages/Dashboard';
import MicroCRM from './pages/MicroCRM';
import CustomerProfile from './pages/CustomerMicrosite';
import GapAnalysis from './pages/GapAnalysis';
import Onboarding from './pages/Onboarding';
import Billing from './pages/Billing';
import SocialComposer from './pages/SocialComposer';
import AdCampaigns from './pages/AdCampaigns';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import LeadsDashboard from './pages/LeadsDashboard';
import MicrositeBuilder from './pages/MicrositeBuilder';
import LeadCapturePage from './pages/LeadCapturePage';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import NewsListing from './pages/NewsListing';
import NewsArticleDetail from './pages/NewsArticleDetail';
import Testimonials from './pages/Testimonials';
import Sitemap from './pages/Sitemap';
import AutomationRules from './pages/AutomationRules';
import Support from './pages/Support';
import AutomationOverview from './components/automation/AutomationOverview';
import RuleCategoryView from './components/automation/RuleCategoryView';
import RuleBuilder from './pages/RuleBuilder';
import TemplatesManager from './pages/TemplatesManager';
import AutomationSettings from './pages/AutomationSettings';
import AutomationEventLog from './pages/AutomationEventLog';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <GTMProvider>
              <Router>
                <RouteAnalyticsTracker />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/capture/:campaignId" element={<LeadCapturePage />} />
                  
                  <Route path="/" element={<Layout><Dashboard /></Layout>} />
                  <Route path="/micro-crm" element={<Layout><MicroCRM /></Layout>} />
                  <Route path="/customer/:customerId" element={<Layout><CustomerProfile /></Layout>} />
                  <Route path="/gap-analysis" element={<Layout><GapAnalysis /></Layout>} />
                  <Route path="/onboarding" element={<Layout><Onboarding /></Layout>} />
                  <Route path="/billing" element={<Layout><Billing /></Layout>} />
                  <Route path="/social-composer" element={<Layout><SocialComposer /></Layout>} />
                  <Route path="/ad-campaigns" element={<Layout><AdCampaigns /></Layout>} />
                  <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
                  <Route path="/profile" element={<Layout><Profile /></Layout>} />
                  <Route path="/settings" element={<Layout><Settings /></Layout>} />

                  <Route path="/crm/automation-rules" element={<Layout><AutomationRules /></Layout>}>
                    <Route index element={<AutomationOverview />} />
                    <Route path="new" element={<RuleBuilder />} />
                    <Route path="edit/:ruleId" element={<RuleBuilder />} />
                    <Route path="templates" element={<TemplatesManager />} />
                    <Route path="settings" element={<AutomationSettings />} />
                    <Route path="event-log" element={<AutomationEventLog />} />
                    <Route path=":category" element={<RuleCategoryView />} />
                  </Route>

                  <Route path="/user-management" element={<Layout><UserManagement /></Layout>} />
                  <Route path="/leads-dashboard" element={<Layout><LeadsDashboard /></Layout>} />
                  <Route path="/microsite-builder" element={<Layout><MicrositeBuilder /></Layout>} />
                  <Route path="/executive-dashboard" element={<Layout><ExecutiveDashboard /></Layout>} />
                  <Route path="/news" element={<Layout><NewsListing /></Layout>} />
                  <Route path="/news/:articleId" element={<Layout><NewsArticleDetail /></Layout>} />
                  <Route path="/testimonials" element={<Layout><Testimonials /></Layout>} />
                  <Route path="/sitemap" element={<Layout><Sitemap /></Layout>} />
                  <Route path="/support" element={<Layout><Support /></Layout>} />

                  {/* Redirects */}
                  <Route path="/campaigns" element={<Navigate to="/analytics" replace />} />
                  <Route path="/microsite" element={<Navigate to="/microsite-builder" replace />} />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </GTMProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;