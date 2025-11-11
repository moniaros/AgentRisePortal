import React from 'react';
import { Lead } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import SkeletonLoader from '../../ui/SkeletonLoader';

interface SampleLeadSelectorProps {
    leads: Lead[];
    isLoading: boolean;
    selectedLead: Lead | null;
    onSelectLead: (lead: Lead | null) => void;
    onRunTest: () => void;
}

const SampleLeadSelector: React.FC<SampleLeadSelectorProps> = ({ leads, isLoading, selectedLead, onSelectLead, onRunTest }) => {
    const { t } = useLocalization();

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lead = leads.find(l => l.id === e.target.value) || null;
        onSelectLead(lead);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t('automationRules.testing.selectLead')}</h3>

            {isLoading ? <SkeletonLoader className="h-24 w-full" /> : (
                <>
                    <select
                        onChange={handleSelectChange}
                        value={selectedLead?.id || ''}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                        <option value="" disabled>Select a lead...</option>
                        {leads.map(lead => (
                            <option key={lead.id} value={lead.id}>
                                {lead.firstName} {lead.lastName} ({lead.email})
                            </option>
                        ))}
                    </select>

                    {selectedLead && (
                        <div className="p-4 border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-sm grid grid-cols-2 gap-4">
                            <div><strong className="text-gray-500">Status:</strong> {selectedLead.status}</div>
                            <div><strong className="text-gray-500">Score:</strong> {selectedLead.score}</div>
                            <div><strong className="text-gray-500">Source:</strong> {selectedLead.source}</div>
                            <div><strong className="text-gray-500">Policy Interest:</strong> {selectedLead.policyType}</div>
                        </div>
                    )}

                    <div className="text-center">
                        <button
                            onClick={onRunTest}
                            disabled={!selectedLead}
                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {t('automationRules.testing.runTest')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SampleLeadSelector;