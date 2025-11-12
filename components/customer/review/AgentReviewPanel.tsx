import React from 'react';
import { StoredFinding, FindingStatus } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import SuggestionCard from './SuggestionCard';

interface AgentReviewPanelProps {
    findings: StoredFinding[];
    onUpdateStatus: (findingId: string, newStatus: FindingStatus) => void;
    onUpdateContent: (findingId: string, newContent: { title: string, description: string, benefit?: string }) => void;
}

const AgentReviewPanel: React.FC<AgentReviewPanelProps> = ({ findings, onUpdateStatus, onUpdateContent }) => {
    const { t } = useLocalization();

    if (findings.length === 0) {
        return null;
    }

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">{t('customer.review.title')}</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 mb-4">{t('customer.review.description')}</p>
            <div className="space-y-4">
                {findings.map(finding => (
                    <SuggestionCard 
                        key={finding.id}
                        finding={finding}
                        onConfirm={() => onUpdateStatus(finding.id, 'verified')}
                        onDismiss={() => onUpdateStatus(finding.id, 'dismissed')}
                        onSave={onUpdateContent}
                    />
                ))}
            </div>
        </div>
    );
};

export default AgentReviewPanel;
