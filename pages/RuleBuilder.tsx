import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAutomationRules } from '../hooks/useAutomationRules';
import { useLocalization } from '../hooks/useLocalization';
import { AutomationRule } from '../types';
import ConditionRow from '../components/automation/builder/ConditionRow';
import ActionRow from '../components/automation/builder/ActionRow';
import { useTemplates } from '../hooks/useTemplates';
import RuleTesterModal from '../components/automation/testing/RuleTesterModal';
import { generateGeminiContent } from '../services/geminiClient';

const defaultRule: Omit<AutomationRule, 'id' | 'agencyId'> = {
    name: '',
    description: '',
    category: 'lead_conversion',
    triggerType: 'on_lead_creation',
    logicalOperator: 'AND',
    conditions: [],
    actions: [],
    isEnabled: true,
    lastExecuted: null,
    successRate: 0,
};

const RuleBuilder: React.FC = () => {
    const { ruleId } = useParams<{ ruleId: string }>();
    const navigate = useNavigate();
    const { t } = useLocalization();
    const { rules, addRule, updateRule } = useAutomationRules();
    const { templates } = useTemplates();
    const [isTesterOpen, setIsTesterOpen] = useState(false);
    const [nlPrompt, setNlPrompt] = useState('');
    const [isGeneratingAiRule, setIsGeneratingAiRule] = useState(false);

    const isEditing = Boolean(ruleId);

    const methods = useForm<AutomationRule>({
        defaultValues: defaultRule,
    });
    const { register, control, handleSubmit, reset, getValues } = methods;

    const { fields: conditionFields, append: appendCondition, remove: removeCondition } = useFieldArray({
        control,
        name: 'conditions',
    });

    const { fields: actionFields, append: appendAction, remove: removeAction } = useFieldArray({
        control,
        name: 'actions',
    });

    useEffect(() => {
        if (isEditing) {
            const ruleToEdit = rules.find((r) => r.id === ruleId);
            if (ruleToEdit) {
                reset(ruleToEdit);
            }
        } else {
            reset(defaultRule);
        }
    }, [ruleId, rules, isEditing, reset]);

    const handleGenerateFromNaturalLanguage = async () => {
        if (!nlPrompt.trim()) return;
        setIsGeneratingAiRule(true);
        try {
            const prompt = `Convert this insurance agency automation instruction into JSON matching AutomationRule:
Instruction: "${nlPrompt}"
Allowed triggerType: "on_lead_creation" | "on_status_change" | "on_renewal_approaching"
Allowed logicalOperator: "AND" | "OR"
Allowed condition fields: "lead_status" (new|contacted|qualified|closed|rejected), "lead_score" (number), "policy_interest" (auto|home|life|health), "potential_value" (number), "lead_source" (string), "days_to_renewal" (number)
Allowed operators: "is" | "is_not" | "equals" | "greater_than" | "less_than" | "contains"
Allowed action types: "send_email" | "send_sms" | "send_viber" | "send_whatsapp" | "create_task" | "create_opportunity"
Return ONLY valid JSON with { name, description, category: "lead_conversion"|"communication_automation", triggerType, logicalOperator, conditions: [{id, field, operator, value}], actions: [{id, type, templateId: "", taskTitle}] }.`;

            const raw = await generateGeminiContent({
                contents: prompt,
                responseMimeType: 'application/json',
            });
            const cleaned = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            const parsed = JSON.parse(cleaned);
            reset({
                ...defaultRule,
                ...parsed,
                isEnabled: true,
            });
        } catch (err) {
            console.error('Failed generating AI rule:', err);
        } finally {
            setIsGeneratingAiRule(false);
        }
    };

    const onSubmit = (data: AutomationRule) => {
        if (isEditing) {
            updateRule(data);
        } else {
            addRule(data);
        }
        navigate('/crm/automation-rules');
    };

    const categoriesObj = t('automationRules.categories', {}) as Record<string, string>;

    return (
        <FormProvider {...methods}>
            <div className="space-y-6 max-w-4xl">
                {!isEditing && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <label htmlFor="nl-rule-input" className="block text-sm font-semibold text-slate-900 dark:text-white mb-1">
                            Describe Workflow in Plain Language
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            Example: &ldquo;When a new Home lead arrives with potential value over 300, send Viber welcome and create a task + pipeline opportunity.&rdquo;
                        </p>
                        <div className="flex gap-2">
                            <input
                                id="nl-rule-input"
                                type="text"
                                value={nlPrompt}
                                onChange={(e) => setNlPrompt(e.target.value)}
                                placeholder="Describe trigger, conditions, and actions..."
                                className="flex-1 px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={handleGenerateFromNaturalLanguage}
                                disabled={isGeneratingAiRule || !nlPrompt.trim()}
                                className="px-4 py-2 text-sm font-semibold bg-slate-900 dark:bg-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                            >
                                {isGeneratingAiRule ? 'Building...' : 'Build Rule'}
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Rule Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="rule-name" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                    Rule Name
                                </label>
                                <input
                                    id="rule-name"
                                    {...register('name', { required: true })}
                                    placeholder="e.g. Instant ENFIA Home Lead Triage"
                                    className="w-full p-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="rule-desc" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="rule-desc"
                                    {...register('description')}
                                    placeholder="Explain what this workflow automates..."
                                    className="w-full p-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="rule-cat" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Category
                                    </label>
                                    <select
                                        id="rule-cat"
                                        {...register('category')}
                                        className="w-full p-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
                                    >
                                        {Object.entries(categoriesObj).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="rule-trigger" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Trigger Event
                                    </label>
                                    <select
                                        id="rule-trigger"
                                        {...register('triggerType')}
                                        className="w-full p-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="on_lead_creation">On Lead Creation</option>
                                        <option value="on_status_change">On Lead Status Change</option>
                                        <option value="on_renewal_approaching">On Policy Renewal Approaching</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="rule-logic" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                        Condition Matching
                                    </label>
                                    <select
                                        id="rule-logic"
                                        {...register('logicalOperator')}
                                        className="w-full p-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
                                    >
                                        <option value="AND">Match ALL Conditions (AND)</option>
                                        <option value="OR">Match ANY Condition (OR)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Conditions</h2>
                        <div className="space-y-3">
                            {conditionFields.map((field, index) => (
                                <ConditionRow key={field.id} control={control} index={index} onRemove={() => removeCondition(index)} />
                            ))}
                            {conditionFields.length === 0 && (
                                <p className="text-xs text-slate-500">No conditions configured — rule will run on every matching trigger.</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                appendCondition({ id: `cond_${Date.now()}`, field: 'lead_status', operator: 'is', value: 'new' })
                            }
                            className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            + Add Condition
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Automated Actions</h2>
                        <div className="space-y-3">
                            {actionFields.map((field, index) => (
                                <ActionRow
                                    key={field.id}
                                    control={control}
                                    index={index}
                                    templates={templates}
                                    onRemove={() => removeAction(index)}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                appendAction({ id: `act_${Date.now()}`, type: 'send_email', templateId: '' })
                            }
                            className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            + Add Action
                        </button>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/crm/automation-rules')}
                            className="px-5 py-2.5 text-sm font-medium bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsTesterOpen(true)}
                            className="px-5 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                        >
                            Test Rule
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                            Save Rule
                        </button>
                    </div>
                </form>

                {isTesterOpen && (
                    <RuleTesterModal isOpen={isTesterOpen} onClose={() => setIsTesterOpen(false)} rule={getValues()} />
                )}
            </div>
        </FormProvider>
    );
};

export default RuleBuilder;