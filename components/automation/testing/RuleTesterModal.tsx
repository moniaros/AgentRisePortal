import React, { useState, useMemo } from 'react';
import { AutomationRule, Lead, SimulationResult } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { useCrmData } from '../../../hooks/useCrmData';
import { simulateRule } from '../../../lib/rule-engine';
import SampleLeadSelector from './SampleLeadSelector';
import SimulationResults from './SimulationResults';

interface RuleTesterModalProps {
    isOpen: boolean;
    onClose: () => void;
    rule: AutomationRule;
}

const RuleTesterModal: React.FC<RuleTesterModalProps> = ({ isOpen, onClose, rule }) => {
    const { t } = useLocalization();
    const { leads, isLoading: isLoadingLeads } = useCrmData();
    
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

    const handleRunTest = () => {
        if (selectedLead) {
            const result = simulateRule(rule, selectedLead);
            setSimulationResult(result);
        }
    };

    const handleBack = () => {
        setSelectedLead(null);
        setSimulationResult(null);
    };

    const handleClose = () => {
        setSelectedLead(null);
        setSimulationResult(null);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{t('automationRules.testing.title')}: <span className="font-normal">{rule.name}</span></h2>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    {!simulationResult ? (
                        <SampleLeadSelector
                            leads={leads}
                            isLoading={isLoadingLeads}
                            selectedLead={selectedLead}
                            onSelectLead={setSelectedLead}
                            onRunTest={handleRunTest}
                        />
                    ) : (
                        <SimulationResults
                            rule={rule}
                            lead={selectedLead!}
                            result={simulationResult}
                        />
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center border-t dark:border-gray-700">
                     {simulationResult && (
                        <button onClick={handleBack} className="px-4 py-2 bg-gray-300 dark:bg-gray-500 rounded">
                           {t('automationRules.testing.backToSelection')}
                        </button>
                    )}
                    <button onClick={handleClose} className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${!simulationResult ? 'ml-auto' : ''}`}>
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RuleTesterModal;