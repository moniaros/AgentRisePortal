import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import {
  PolicyAnalysis,
  PolicyGap,
  UpsellOpportunity,
  CrossSellOpportunity,
  getPolicyAnalysis,
  updateFindingVerification,
  getAnalysisSummary
} from '../../utils/policyAnalysisStorage';

interface AIPolicyAnalysisProps {
  customerId: string;
  onRefresh?: () => void;
}

type VerificationStatus = 'confirmed' | 'rejected' | 'review' | undefined;

const AIPolicyAnalysis: React.FC<AIPolicyAnalysisProps> = ({ customerId, onRefresh }) => {
  const { t } = useLocalization();
  const { currentUser } = useAuth();
  const [analysis, setAnalysis] = useState<PolicyAnalysis | null>(null);
  const [activeSection, setActiveSection] = useState<'gaps' | 'upsell' | 'crossSell' | null>('gaps');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [customerId]);

  const loadAnalysis = () => {
    setLoading(true);
    try {
      const data = getPolicyAnalysis(customerId);
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading policy analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = (
    type: 'gap' | 'upsell' | 'crossSell',
    id: string,
    status: 'confirmed' | 'rejected' | 'review',
    agentNotes?: string
  ) => {
    if (!currentUser) return;

    const userName = `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`;

    const success = updateFindingVerification(customerId, type, id, {
      verified: status,
      agentNotes,
      verifiedBy: userName
    });

    if (success) {
      loadAnalysis();
      setEditingId(null);
      setNotes('');
      if (onRefresh) onRefresh();
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low'): string => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700';
    }
  };

  const getVerificationBadge = (status: VerificationStatus) => {
    if (!status) return null;

    const colors = {
      confirmed: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
      review: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
    };

    const labels = {
      confirmed: '✓ Confirmed',
      rejected: '✗ Rejected',
      review: '⚠ Needs Review'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const renderGapCard = (gap: PolicyGap) => {
    const isEditing = editingId === gap.id;

    return (
      <div
        key={gap.id}
        className={`border rounded-lg p-4 mb-3 ${getSeverityColor(gap.severity)}`}
        role="article"
        aria-label={`Coverage gap: ${gap.area}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{gap.area}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium uppercase">{gap.severity} Priority</span>
              {getVerificationBadge(gap.verified)}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Current Coverage:</span>
            <p className="text-gray-700 dark:text-gray-300">{gap.current}</p>
          </div>
          <div>
            <span className="font-medium">Recommended:</span>
            <p className="text-gray-700 dark:text-gray-300">{gap.recommended}</p>
          </div>
          <div>
            <span className="font-medium">Reason:</span>
            <p className="text-gray-700 dark:text-gray-300">{gap.reason}</p>
          </div>

          {gap.agentNotes && (
            <div className="bg-white/50 dark:bg-gray-800/50 rounded p-2 mt-2">
              <span className="font-medium text-xs">Agent Notes:</span>
              <p className="text-gray-700 dark:text-gray-300 text-xs mt-1">{gap.agentNotes}</p>
              {gap.verifiedBy && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  By {gap.verifiedBy} on {new Date(gap.verifiedAt!).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add agent notes..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                rows={3}
                aria-label="Agent notes"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerification('gap', gap.id, 'confirmed', notes)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  aria-label="Confirm finding"
                >
                  ✓ Confirm
                </button>
                <button
                  onClick={() => handleVerification('gap', gap.id, 'review', notes)}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  aria-label="Mark for review"
                >
                  ⚠ Review
                </button>
                <button
                  onClick={() => handleVerification('gap', gap.id, 'rejected', notes)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  aria-label="Reject finding"
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setNotes('');
                  }}
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingId(gap.id);
                setNotes(gap.agentNotes || '');
              }}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              aria-label="Verify this finding"
            >
              {gap.verified ? 'Update Verification' : 'Verify Finding'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderUpsellCard = (upsell: UpsellOpportunity) => {
    const isEditing = editingId === upsell.id;
    const priorityColor = upsell.priority === 'high' ? 'border-orange-300 dark:border-orange-700' :
                         upsell.priority === 'medium' ? 'border-blue-300 dark:border-blue-700' :
                         'border-gray-300 dark:border-gray-600';

    return (
      <div
        key={upsell.id}
        className={`border-2 ${priorityColor} rounded-lg p-4 mb-3 bg-white dark:bg-gray-800`}
        role="article"
        aria-label={`Upsell opportunity: ${upsell.product}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{upsell.product}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                {upsell.priority} Priority
              </span>
              {getVerificationBadge(upsell.verified)}
            </div>
          </div>
          {upsell.estimatedPremium && (
            <div className="text-right">
              <span className="text-sm text-gray-500 dark:text-gray-400">Est. Premium</span>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">
                ${upsell.estimatedPremium.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <span className="font-medium">Recommendation:</span>
            <p>{upsell.recommendation}</p>
          </div>
          <div>
            <span className="font-medium">Benefit:</span>
            <p>{upsell.benefit}</p>
          </div>

          {upsell.agentNotes && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 mt-2">
              <span className="font-medium text-xs">Agent Notes:</span>
              <p className="text-xs mt-1">{upsell.agentNotes}</p>
              {upsell.verifiedBy && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  By {upsell.verifiedBy} on {new Date(upsell.verifiedAt!).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add agent notes..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerification('upsell', upsell.id, 'confirmed', notes)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  ✓ Confirm
                </button>
                <button
                  onClick={() => handleVerification('upsell', upsell.id, 'review', notes)}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  ⚠ Review
                </button>
                <button
                  onClick={() => handleVerification('upsell', upsell.id, 'rejected', notes)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setNotes('');
                  }}
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingId(upsell.id);
                setNotes(upsell.agentNotes || '');
              }}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {upsell.verified ? 'Update Verification' : 'Verify Opportunity'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderCrossSellCard = (crossSell: CrossSellOpportunity) => {
    const isEditing = editingId === crossSell.id;
    const priorityColor = crossSell.priority === 'high' ? 'border-purple-300 dark:border-purple-700' :
                         crossSell.priority === 'medium' ? 'border-indigo-300 dark:border-indigo-700' :
                         'border-gray-300 dark:border-gray-600';

    return (
      <div
        key={crossSell.id}
        className={`border-2 ${priorityColor} rounded-lg p-4 mb-3 bg-white dark:bg-gray-800`}
        role="article"
        aria-label={`Cross-sell opportunity: ${crossSell.product}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{crossSell.product}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                {crossSell.priority} Priority
              </span>
              {getVerificationBadge(crossSell.verified)}
            </div>
          </div>
          {crossSell.estimatedPremium && (
            <div className="text-right">
              <span className="text-sm text-gray-500 dark:text-gray-400">Est. Premium</span>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">
                ${crossSell.estimatedPremium.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <span className="font-medium">Recommendation:</span>
            <p>{crossSell.recommendation}</p>
          </div>
          <div>
            <span className="font-medium">Benefit:</span>
            <p>{crossSell.benefit}</p>
          </div>

          {crossSell.agentNotes && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 mt-2">
              <span className="font-medium text-xs">Agent Notes:</span>
              <p className="text-xs mt-1">{crossSell.agentNotes}</p>
              {crossSell.verifiedBy && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  By {crossSell.verifiedBy} on {new Date(crossSell.verifiedAt!).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add agent notes..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerification('crossSell', crossSell.id, 'confirmed', notes)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  ✓ Confirm
                </button>
                <button
                  onClick={() => handleVerification('crossSell', crossSell.id, 'review', notes)}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  ⚠ Review
                </button>
                <button
                  onClick={() => handleVerification('crossSell', crossSell.id, 'rejected', notes)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setNotes('');
                  }}
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditingId(crossSell.id);
                setNotes(crossSell.agentNotes || '');
              }}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {crossSell.verified ? 'Update Verification' : 'Verify Opportunity'}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No AI Policy Analysis Available
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Run a policy analysis to see coverage gaps and opportunities.
          </p>
        </div>
      </div>
    );
  }

  const summary = getAnalysisSummary(customerId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md" role="region" aria-label="AI Policy Analysis">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              AI Policy Analysis
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Analyzed on {new Date(analysis.analyzedAt).toLocaleDateString()} • Source: AI Policy Analysis
            </p>
          </div>
          <button
            onClick={loadAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            aria-label="Refresh analysis"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.totalGaps}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Coverage Gaps</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.totalUpsells}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Upsell Opportunities</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.totalCrossSells}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Cross-Sell Opportunities</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.unverifiedCount}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Unverified Items</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px" aria-label="Analysis sections">
          <button
            onClick={() => setActiveSection('gaps')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeSection === 'gaps'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            aria-current={activeSection === 'gaps' ? 'page' : undefined}
          >
            Coverage Gaps ({analysis.gaps.length})
          </button>
          <button
            onClick={() => setActiveSection('upsell')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeSection === 'upsell'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            aria-current={activeSection === 'upsell' ? 'page' : undefined}
          >
            Upsell Opportunities ({analysis.upsellOpportunities.length})
          </button>
          <button
            onClick={() => setActiveSection('crossSell')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeSection === 'crossSell'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            aria-current={activeSection === 'crossSell' ? 'page' : undefined}
          >
            Cross-Sell Opportunities ({analysis.crossSellOpportunities.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeSection === 'gaps' && (
          <div role="tabpanel" aria-labelledby="gaps-tab">
            {analysis.gaps.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No coverage gaps identified.
              </p>
            ) : (
              <div className="space-y-3">
                {analysis.gaps.map(gap => renderGapCard(gap))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'upsell' && (
          <div role="tabpanel" aria-labelledby="upsell-tab">
            {analysis.upsellOpportunities.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No upsell opportunities identified.
              </p>
            ) : (
              <div className="space-y-3">
                {analysis.upsellOpportunities.map(upsell => renderUpsellCard(upsell))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'crossSell' && (
          <div role="tabpanel" aria-labelledby="crossSell-tab">
            {analysis.crossSellOpportunities.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No cross-sell opportunities identified.
              </p>
            ) : (
              <div className="space-y-3">
                {analysis.crossSellOpportunities.map(crossSell => renderCrossSellCard(crossSell))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPolicyAnalysis;
