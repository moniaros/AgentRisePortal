import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import GTMProvider from './components/GTMProvider';
import ErrorBoundary from './components/ErrorBoundary';
import RouteAnalyticsTracker from './components/RouteAnalyticsTracker';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadGeneration from './pages/LeadGeneration';
import MicroCRM from './pages/MicroCRM';
import CustomerProfile from './pages/CustomerMicrosite';
import GapAnalysis from './pages/GapAnalysis';
import Onboarding from './pages/Onboarding';
import Billing from './pages/Billing';
import MicrositeBuilder from './pages/MicrositeBuilder';
import SocialComposer from './pages/SocialComposer';
import AdCampaigns from './pages/AdCampaigns';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import LeadsDashboard from './pages/LeadsDashboard';
import LeadCapturePage from './pages/LeadCapturePage';

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
                  <Route path="/lead-capture/:campaignId" element={<LeadCapturePage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/customer/:customerId" element={<Layout><CustomerProfile /></Layout>} />
                  <Route path="/" element={<Layout><Dashboard /></Layout>} />
                  <Route path="/leads-dashboard" element={<Layout><LeadsDashboard /></Layout>} />
                  <Route path="/lead-generation" element={<Layout><LeadGeneration /></Layout>} />
                  <Route path="/micro-crm" element={<Layout><MicroCRM /></Layout>} />
                  <Route path="/gap-analysis" element={<Layout><GapAnalysis /></Layout>} />
                  <Route path="/onboarding" element={<Layout><Onboarding /></Layout>} />
                  <Route path="/billing" element={<Layout><Billing /></Layout>} />
                  <Route path="/microsite-builder" element={<Layout><MicrositeBuilder /></Layout>} />
                  <Route path="/social-composer" element={<Layout><SocialComposer /></Layout>} />
                  <Route path="/campaigns" element={<Layout><AdCampaigns /></Layout>} />
                  <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
                  <Route path="/user-management" element={<Layout><UserManagement /></Layout>} />
                  <Route path="/settings" element={<Layout><Settings /></Layout>} />
                  <Route path="/profile" element={<Layout><Profile /></Layout>} />

                  {/* Fallback Route */}
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