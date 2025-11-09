import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadGeneration from './pages/LeadGeneration';
import MicroCRM from './pages/MicroCRM';
import CustomerMicrosite from './pages/CustomerMicrosite';
import GapAnalysis from './pages/GapAnalysis';
import Onboarding from './pages/Onboarding';
import Billing from './pages/Billing';
import MicrositeBuilder from './pages/MicrositeBuilder';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Logout from './pages/Logout';
import ErrorBoundary from './components/ErrorBoundary';
import GTMProvider from './components/GTMProvider';
import RouteAnalyticsTracker from './components/RouteAnalyticsTracker';
import SocialComposer from './pages/SocialComposer';

function App() {
  return (
    <ErrorBoundary>
      <GTMProvider>
        <LanguageProvider>
            <Router>
                <RouteAnalyticsTracker />
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/lead-generation" element={<LeadGeneration />} />
                        <Route path="/micro-crm" element={<MicroCRM />} />
                        <Route path="/customer/:id" element={<CustomerMicrosite />} />
                        <Route path="/gap-analysis" element={<GapAnalysis />} />
                        <Route path="/microsite-builder" element={<MicrositeBuilder />} />
                        <Route path="/social-composer" element={<SocialComposer />} />
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/billing" element={<Billing />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                </Layout>
            </Router>
        </LanguageProvider>
      </GTMProvider>
    </ErrorBoundary>
  );
}

export default App;