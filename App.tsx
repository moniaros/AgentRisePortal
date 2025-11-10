import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import GTMProvider from './components/GTMProvider';
import RouteAnalyticsTracker from './components/RouteAnalyticsTracker';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const LeadGeneration = React.lazy(() => import('./pages/LeadGeneration'));
const MicroCRM = React.lazy(() => import('./pages/MicroCRM'));
const CustomerMicrosite = React.lazy(() => import('./pages/CustomerMicrosite'));
const GapAnalysis = React.lazy(() => import('./pages/GapAnalysis'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Billing = React.lazy(() => import('./pages/Billing'));
const MicrositeBuilder = React.lazy(() => import('./pages/MicrositeBuilder'));
const SocialComposer = React.lazy(() => import('./pages/SocialComposer'));
const AdCampaigns = React.lazy(() => import('./pages/AdCampaigns'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Logout = React.lazy(() => import('./pages/Logout'));
const LeadCapturePage = React.lazy(() => import('./pages/LeadCapturePage'));
const LeadsDashboard = React.lazy(() => import('./pages/LeadsDashboard'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <GTMProvider>
            <Router>
              <RouteAnalyticsTracker />
              <React.Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/capture/:campaignId" element={<LeadCapturePage />} />

                  {/* Protected routes wrapped by Layout */}
                  <Route path="/" element={<Layout><Dashboard /></Layout>} />
                  <Route path="/dashboard" element={<Navigate to="/" />} />
                  <Route path="/leads-dashboard" element={<Layout><LeadsDashboard /></Layout>} />
                  <Route path="/lead-generation" element={<Layout><LeadGeneration /></Layout>} />
                  <Route path="/micro-crm" element={<Layout><MicroCRM /></Layout>} />
                  <Route path="/customer/:id" element={<Layout><CustomerMicrosite /></Layout>} />
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
                  <Route path="/logout" element={<Logout />} />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<Layout><div>404 - Not Found</div></Layout>} />
                </Routes>
              </React.Suspense>
            </Router>
          </GTMProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;