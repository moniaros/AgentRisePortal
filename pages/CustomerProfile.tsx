import React, { useMemo, useState } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { useCrmData } from '../hooks/useCrmData';
import { useAuth } from '../hooks/useAuth';
import { Customer, TimelineEvent, Policy, PolicyType, TransactionInquiry } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import CustomerTimeline from '../components/customer/CustomerTimeline';
import AddTimelineEventModal from '../components/customer/AddTimelineEventModal';
import AttentionFlagModal from '../components/customer/AttentionFlagModal';
import AddressChangeModal from '../components/customer/AddressChangeModal';
import EditProfileModal from '../components/customer/EditProfileModal';
import EmbeddedGapAnalysis from '../components/customer/EmbeddedGapAnalysis';
import StoredAnalysisCard from '../components/customer/StoredAnalysisCard';
import { useAnalysisData } from '../hooks/useAnalysisData';
import DetailedPolicyView from '../components/customer/DetailedPolicyView';
import ConsentManagement from '../components/customer/ConsentManagement';
import AgentReviewPanel from '../components/customer/review/AgentReviewPanel';
import ActionableOpportunities from '../components/customer/opportunities/ActionableOpportunities';
import { useFindingsData } from '../hooks/useFindingsData';
import { usePipelineData } from '../hooks/usePipelineData';
import { useNotification } from '../hooks/useNotification';
import {
    evaluateCustomerHouseholdProfile,
    buildCoverageAuditDocument,
} from '../lib/renewalEngine';

const ALL_PILLARS: PolicyType[] = [
    PolicyType.AUTO,
    PolicyType.HOME,
    PolicyType.HEALTH,
    PolicyType.LIFE,
];

const CustomerProfile: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { addNotification } = useNotification();
    const { createOpportunity } = usePipelineData();
    const {
        customers,
        isLoading,
        error,
        addTimelineEvent,
        addAnnotationToEvent,
        updateCustomer,
        updateCustomerAttentionFlag,
        toggleTimelineEventFlag,
    } = useCrmData();

    const [activeTab, setActiveTab] = useState<'timeline' | 'policies' | 'analysis'>('timeline');
    const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
    const [isAttentionModalOpen, setAttentionModalOpen] = useState(false);
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);

    const customer = useMemo(() => {
        return customers.find((c) => c.id === customerId);
    }, [customers, customerId]);

    const householdProfile = useMemo(() => {
        return customer ? evaluateCustomerHouseholdProfile(customer) : null;
    }, [customer]);

    const { analyses, isLoading: isLoadingAnalyses } = useAnalysisData(customerId);
    const {
        pendingFindings,
        verifiedOpportunities,
        updateFindingStatus,
        updateFindingContent,
        isLoading: isLoadingFindings,
    } = useFindingsData(customerId);

    if (isLoading) {
        return <SkeletonLoader className="h-screen w-full" />;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    if (!customer || !householdProfile) {
        return <Navigate to="/micro-crm" replace />;
    }

    const handleAddTimelineEvent = (
        data: Omit<TimelineEvent, 'id' | 'date' | 'author' | 'annotations'>
    ) => {
        addTimelineEvent(customer.id, {
            ...data,
            author: currentUser
                ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`
                : 'System',
        });
        setAddEventModalOpen(false);
    };

    const handleAddAnnotation = (eventId: string, content: string) => {
        addAnnotationToEvent(customer.id, eventId, {
            author: currentUser
                ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`
                : 'System',
            content,
        });
    };

    const handleAttentionFlagSubmit = (reason: string) => {
        updateCustomerAttentionFlag(customer.id, reason);
        setAttentionModalOpen(false);
    };

    const handleClearAttentionFlag = () => {
        updateCustomerAttentionFlag(customer.id, null);
    };

    const handleAddressChange = (newAddress: string) => {
        updateCustomer({ ...customer, address: newAddress });
        setAddressModalOpen(false);
    };

    const handleProfileUpdate = (updatedCustomer: Customer) => {
        updateCustomer(updatedCustomer);
        setEditProfileModalOpen(false);
    };

    const handlePolicyUpdate = (updatedPolicy: Policy) => {
        const updatedPolicies = customer.policies.map((p) =>
            p.id === updatedPolicy.id ? updatedPolicy : p
        );
        updateCustomer({ ...customer, policies: updatedPolicies });
    };

    const handleQuoteGapInPipeline = (targetLine: PolicyType, estimatedPremium: number) => {
        const syntheticInquiry: TransactionInquiry = {
            id: `inq_gap_${Date.now()}`,
            agencyId: customer.agencyId || 'agency_1',
            createdAt: new Date().toISOString(),
            contact: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone || '',
            },
            consentGDPR: true,
            source: 'Household Risk Audit',
            purpose: 'quote_request',
            attribution: { utm_source: 'crm', utm_medium: 'household_audit' },
            attributionId: `audit_${customer.id}`,
            policyType: targetLine,
            details: householdProfile.priorityRecommendation,
        };
        const created = createOpportunity(syntheticInquiry, estimatedPremium);
        if (created) {
            addNotification(
                `Created ${targetLine.toUpperCase()} Comparative Quote deal for ${customer.firstName} ${customer.lastName}`,
                'success'
            );
            navigate('/pipeline/board');
        }
    };

    const handleExportCoverageAudit = () => {
        const html = buildCoverageAuditDocument(customer, householdProfile);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Coverage-Audit-${customer.lastName}-${customer.id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addNotification('Downloaded EU IDD Household Coverage Audit dossier', 'success');
    };

    return (
        <div className="space-y-6">
            <header className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                {customer.attentionFlag && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 rounded-lg text-sm mb-4 flex justify-between items-center">
                        <div>
                            <strong className="font-semibold">Retention Alert:</strong>{' '}
                            {customer.attentionFlag}
                        </div>
                        <button
                            onClick={handleClearAttentionFlag}
                            className="text-xs font-semibold hover:underline"
                        >
                            Resolve
                        </button>
                    </div>
                )}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {customer.firstName} {customer.lastName}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {customer.email}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            to={`/wallet/${customer.id}`}
                            className="px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Open Client Wallet
                        </Link>
                        <button
                            onClick={handleExportCoverageAudit}
                            className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Export Coverage Audit
                        </button>
                        <button
                            onClick={() => setAttentionModalOpen(true)}
                            className="px-3 py-1.5 text-sm font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
                        >
                            Flag Account
                        </button>
                        <button
                            onClick={() => setEditProfileModalOpen(true)}
                            className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
                            Phone
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white tabular-nums">
                            {customer.phone || 'N/A'}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
                            Address
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {customer.address || 'N/A'}{' '}
                            <button
                                onClick={() => setAddressModalOpen(true)}
                                className="text-blue-600 dark:text-blue-400 text-xs font-semibold ml-1 hover:underline"
                            >
                                Edit
                            </button>
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
                            Active Policies
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                            {householdProfile.activePoliciesCount}
                        </span>
                    </div>
                    <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
                            Household Annual GWP
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                            €{householdProfile.totalAnnualGwp.toFixed(2)}
                        </span>
                    </div>
                </div>
            </header>

            {/* Household Risk & ENFIA -20% Readiness Panel */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Household Protection Completeness
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {householdProfile.priorityRecommendation}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <span className="text-xs text-gray-500 uppercase tracking-wider block">
                                Protection Index
                            </span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                                {householdProfile.completenessScore}/100
                            </span>
                        </div>
                        <div className="w-28 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${
                                    householdProfile.completenessScore >= 75
                                        ? 'bg-emerald-500'
                                        : householdProfile.completenessScore >= 45
                                        ? 'bg-amber-500'
                                        : 'bg-red-500'
                                }`}
                                style={{ width: `${householdProfile.completenessScore}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ALL_PILLARS.map((line) => {
                        const isCovered = householdProfile.coveredLines.includes(line);
                        return (
                            <div
                                key={line}
                                className={`p-3 rounded-lg border flex items-center justify-between ${
                                    isCovered
                                        ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-900/15'
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/30'
                                }`}
                            >
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200 block">
                                        {line}
                                    </span>
                                    <span
                                        className={`text-xs ${
                                            isCovered
                                                ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        {isCovered ? 'Active Coverage' : 'Uninsured Gap'}
                                    </span>
                                </div>
                                {!isCovered && (
                                    <button
                                        onClick={() =>
                                            handleQuoteGapInPipeline(
                                                line,
                                                line === PolicyType.HEALTH ? 980 : 420
                                            )
                                        }
                                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Quote →
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {householdProfile.hasHomePolicy && !householdProfile.enfiaEligible && (
                    <div className="p-4 rounded-lg bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-sm">
                            <span className="font-semibold text-blue-900 dark:text-blue-200 block">
                                ENFIA -20% Property Tax Discount Ineligible
                            </span>
                            <span className="text-blue-800 dark:text-blue-300">
                                Current Home policy is missing{' '}
                                <strong>{householdProfile.missingEnfiaPerils.join(' & ')}</strong>.
                                Adding catastrophe perils unlocks statutory -20% ENFIA savings.
                            </span>
                        </div>
                        <button
                            onClick={() => handleQuoteGapInPipeline(PolicyType.HOME, 265)}
                            className="flex-shrink-0 px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Quote ENFIA Home Upgrade
                        </button>
                    </div>
                )}
            </section>

            <ConsentManagement customer={customer} onUpdateCustomer={updateCustomer} />

            {isLoadingFindings ? (
                <SkeletonLoader className="h-48 w-full" />
            ) : (
                <>
                    {pendingFindings.length > 0 && (
                        <AgentReviewPanel
                            findings={pendingFindings}
                            onUpdateStatus={updateFindingStatus}
                            onUpdateContent={updateFindingContent}
                        />
                    )}
                    {verifiedOpportunities.length > 0 && (
                        <ActionableOpportunities
                            opportunities={verifiedOpportunities}
                            customer={customer}
                        />
                    )}
                </>
            )}

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'timeline'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Timeline
                    </button>
                    <button
                        onClick={() => setActiveTab('policies')}
                        className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'policies'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        Policies ({customer.policies.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`whitespace-nowrap py-3.5 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'analysis'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        AI Gap Analysis
                    </button>
                </nav>
            </div>

            {activeTab === 'timeline' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setAddEventModalOpen(true)}
                            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add Timeline Event
                        </button>
                    </div>
                    <CustomerTimeline
                        timeline={customer.timeline}
                        onAddAnnotation={handleAddAnnotation}
                        onFlagEvent={(eventId) => toggleTimelineEventFlag(customer.id, eventId)}
                    />
                </div>
            )}

            {activeTab === 'policies' && (
                <div className="space-y-4">
                    {customer.policies.length > 0 ? (
                        customer.policies.map((policy) => (
                            <DetailedPolicyView
                                key={policy.id}
                                policy={policy}
                                onUpdatePolicy={handlePolicyUpdate}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No policies found.</p>
                    )}
                </div>
            )}

            {activeTab === 'analysis' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        New Policy Analysis
                    </h2>
                    <EmbeddedGapAnalysis customer={customer} />
                    <h2 className="text-lg font-semibold pt-4 border-t border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                        Past Analyses
                    </h2>
                    {isLoadingAnalyses && <SkeletonLoader className="h-32 w-full" />}
                    {analyses.map((analysis) => (
                        <StoredAnalysisCard key={analysis.id} analysis={analysis} />
                    ))}
                </div>
            )}

            <AddTimelineEventModal
                isOpen={isAddEventModalOpen}
                onClose={() => setAddEventModalOpen(false)}
                onSubmit={handleAddTimelineEvent}
            />
            <AttentionFlagModal
                isOpen={isAttentionModalOpen}
                onClose={() => setAttentionModalOpen(false)}
                onSubmit={handleAttentionFlagSubmit}
                currentReason={customer.attentionFlag}
            />
            <AddressChangeModal
                isOpen={isAddressModalOpen}
                onClose={() => setAddressModalOpen(false)}
                onSubmit={handleAddressChange}
                currentAddress={customer.address || ''}
            />
            <EditProfileModal
                isOpen={isEditProfileModalOpen}
                onClose={() => setEditProfileModalOpen(false)}
                onSubmit={handleProfileUpdate}
                customer={customer}
            />
        </div>
    );
};

export default CustomerProfile;