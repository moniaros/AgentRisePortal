import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout and Pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import LeadGeneration from './pages/LeadGeneration';
import MicroCRM from './pages/MicroCRM';
import CustomerProfile from './pages/CustomerProfile';
import GapAnalysis from './pages/GapAnalysis';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import SocialComposer from './pages/SocialComposer';
import AdCampaigns from './pages/AdCampaigns';
import Analytics from './pages/Analytics';
import MicrositeBuilder from './pages/MicrositeBuilder';
import LeadsDashboard from './pages/LeadsDashboard';
import NewsListing from './pages/NewsListing';
import NewsArticleDetail from './pages/NewsArticleDetail';
import Testimonials from './pages/Testimonials';
import AutomationRules from './pages/AutomationRules';
import RuleBuilder from './pages/RuleBuilder';
import AutomationOverview from './components/automation/AutomationOverview';
import RuleCategoryView from './components/automation/RuleCategoryView';
import TemplatesManager from './pages/TemplatesManager';
import AutomationSettings from './pages/AutomationSettings';
import AutomationEventLog from './pages/AutomationEventLog';
import Support from './pages/Support';
import Sitemap from './pages/Sitemap';
import LeadCapturePage from './pages/LeadCapturePage';
import ExecutiveDashboard from './pages/ExecutiveDashboard';

// Contexts and Utilities
// FIX: The useAuth hook is in its own file, not in the AuthContext file.
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import GTMProvider from './components/GTMProvider';
import RouteAnalyticsTracker from './components/RouteAnalyticsTracker';
import { useOnboardingStatus } from './hooks/useOnboardingStatus';

// A wrapper to handle protected routes and onboarding redirection
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { isSkipped } = useOnboardingStatus();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isSkipped) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

const AppRoutes: React.FC = () => {
  const { currentUser } = useAuth();
  const { isSkipped } = useOnboardingStatus();

  return (
    <Router>
      <RouteAnalyticsTracker />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/campaign/lead/:campaignId" element={<LeadCapturePage />} />
        
        {!isSkipped && currentUser && (
          <Route path="/onboarding" element={<Onboarding />} />
        )}

        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
                <Route path="/leads-dashboard" element={<LeadsDashboard />} />
                <Route path="/lead-gen" element={<LeadGeneration />} />
                <Route path="/micro-crm" element={<MicroCRM />} />
                <Route path="/customer/:customerId" element={<CustomerProfile />} />
                <Route path="/gap-analysis" element={<GapAnalysis />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/social-composer" element={<SocialComposer />} />
                <Route path="/ad-campaigns" element={<AdCampaigns />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/microsite-builder" element={<MicrositeBuilder />} />
                <Route path="/news" element={<NewsListing />} />
                <Route path="/news/:articleId" element={<NewsArticleDetail />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/crm/automation-rules" element={<AutomationRules />}>
                    <Route index element={<AutomationOverview />} />
                    <Route path=":category" element={<RuleCategoryView />} />
                    <Route path="templates" element={<TemplatesManager />} />
                    <Route path="settings" element={<AutomationSettings />} />
                    <Route path="event-log" element={<AutomationEventLog />} />
                </Route>
                <Route path="/crm/automation-rules/new" element={<RuleBuilder />} />
                <Route path="/crm/automation-rules/edit/:ruleId" element={<RuleBuilder />} />
                <Route path="/support" element={<Support />} />
                
                {/* Redirect any other paths to the dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};


const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GTMProvider>
        <ThemeProvider>
          <LanguageProvider>
            <NotificationProvider>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </NotificationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </GTMProvider>
    </ErrorBoundary>
  );
};

export default App;