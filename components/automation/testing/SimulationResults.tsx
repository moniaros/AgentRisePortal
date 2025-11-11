import React, { useState } from 'react';
import { AutomationRule, Language, Lead, MessageTemplate, SimulationResult, User } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { useTemplates } from '../../../hooks/useTemplates';
import { useAuth } from '../../../hooks/useAuth';
import { SAMPLE_DATA } from '../../../constants/placeholders';

interface SimulationResultsProps {
    rule: AutomationRule;
    lead: Lead;
    result: SimulationResult;
}

const renderMessagePreview = (
    template: MessageTemplate,
    lead: Lead,
    agent: User | null,
    lang: Language
): string => {
    let content = template.content;
    const sampleAgent = SAMPLE_DATA[lang].agent;
    const sampleLead = SAMPLE_DATA[lang].lead;
    
    content = content.replace(/\{\{Lead.FirstName\}\}/g, lead.firstName || sampleLead.firstName);
    content = content.replace(/\{\{Lead.LastName\}\}/g, lead.lastName || sampleLead.lastName);
    content = content.replace(/\{\{Lead.Email\}\}/g, lead.email);
    content = content.replace(/\{\{Lead.Score\}\}/g, String(lead.score || sampleLead.score));

    const agentFirstName = agent?.party.partyName.firstName || sampleAgent.firstName;
    const agentLastName = agent?.party.partyName.lastName || '';
    content = content.replace(/\{\{Agent.FirstName\}\}/g, agentFirstName);
    content = content.replace(/\{\{Agent.LastName\}\}/g, agentLastName);

    return content;
};


const SimulationResults: React.FC<SimulationResultsProps> = ({ rule, lead, result }) => {
    const { t } = useLocalization();
    const { templates } = useTemplates();
    const { currentUser } = useAuth();
    const [previewLang, setPreviewLang] = useState<Language>(Language.EN);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t('automationRules.testing.results')}</h3>

            {/* Overall Status */}
            <div className={`p-4 rounded-md text-center font-semibold ${result.conditionsMet ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'}`}>
                {result.conditionsMet ? t('automationRules.testing.ruleWouldRun') : t('automationRules.testing.ruleWouldNotRun')}
            </div>

            {/* Conditions Check */}
            <div>
                <h4 className="font-semibold mb-2">{t('automationRules.testing.conditionsCheck')}</h4>
                <ul className="space-y-2">
                    {result.conditionResults.map(({ condition, passed, actualValue }, index) => (
                        <li key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                            <span className={`mr-3 font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>
                                {passed ? `✔ ${t('automationRules.testing.passed')}` : `✖ ${t('automationRules.testing.failed')}`}
                            </span>
                            <div className="flex-grow">
                                <p className="font-mono">{t('automationRules.testing.conditionEval', { field: condition.field, operator: condition.operator, value: condition.value })}</p>
                                <p className="text-xs text-gray-500">{t('automationRules.testing.actualValue', { value: actualValue })}</p>
                            </div>
                        </li>
                    ))}
                    {result.conditionResults.length === 0 && <p className="text-sm text-gray-500">No conditions to test.</p>}
                </ul>
            </div>

            {/* Actions Preview */}
            {result.conditionsMet && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                         <h4 className="font-semibold">{t('automationRules.testing.actionPreview')}</h4>
                         <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setPreviewLang(Language.EN)} className={`text-xs px-2 py-1 rounded ${previewLang === Language.EN ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>EN</button>
                            <button type="button" onClick={() => setPreviewLang(Language.EL)} className={`text-xs px-2 py-1 rounded ${previewLang === Language.EL ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>EL</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {rule.actions.length > 0 ? rule.actions.map(action => {
                            const template = templates.find(t => t.id === action.templateId);
                            return (
                                <div key={action.id} className="p-3 border rounded dark:border-gray-600">
                                    <p className="font-semibold text-sm capitalize mb-2">{action.type.replace(/_/g, ' ')}</p>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded text-xs">
                                        {!template ? (
                                            <p className="text-red-500">{t('automationRules.testing.templateNotFound')}</p>
                                        ) : (
                                            <p className="whitespace-pre-wrap font-mono">{renderMessagePreview(template, lead, currentUser, previewLang)}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-sm text-gray-500">{t('automationRules.testing.noActions')}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimulationResults;