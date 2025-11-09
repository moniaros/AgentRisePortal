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
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
        <LanguageProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/lead-generation" element={<LeadGeneration />} />
                        <Route path="/micro-crm" element={<MicroCRM />} />
                        <Route path="/customer/:id" element={<CustomerMicrosite />} />
                        <Route path="/gap-analysis" element={<GapAnalysis />} />
                        <Route path="/microsite-builder" element={<MicrositeBuilder />} />
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/billing" element={<Billing />} />
                    </Routes>
                </Layout>
            </Router>
        </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;