import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAutomationRules } from '../hooks/useAutomationRules';
import { useLocalization } from '../hooks/useLocalization';
import { AutomationRule } from '../types';
import ConditionRow from '../components/automation/builder/ConditionRow';
import ActionRow from '../components/automation/builder/ActionRow';
import { useTemplates } from '../hooks/useTemplates';
import RuleTesterModal from '../components/automation/testing/RuleTesterModal';

const defaultRule: Omit<AutomationRule, 'id' | 'agencyId'> = {
    name: '',
    description: '',
    category: 'lead_conversion',
    triggerType: 'on_lead_creation',
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

    const isEditing = Boolean(ruleId);
    
    const { register, control, handleSubmit, reset, getValues } = useForm<AutomationRule>({
        defaultValues: defaultRule,
    });

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
            const ruleToEdit = rules.find(r => r.id === ruleId);
            if (ruleToEdit) {
                reset(ruleToEdit);
            }
        } else {
            reset(defaultRule);
        }
    }, [ruleId, rules, isEditing, reset]);

    const onSubmit = (data: AutomationRule) => {
        if (isEditing) {
            updateRule(data);
        } else {
            addRule(data);
        }
        navigate('/crm/automation-rules');
    };
    
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Rule Details</h2>
                    <div className="space-y-4">
                        <input {...register('name', { required: true })} placeholder="Rule Name" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <textarea {...register('description')} placeholder="Description" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={2} />
                         <div className="grid grid-cols-2 gap-4">
                            <select {...register('category')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                {Object.values(t('automationRules.categories', {})).map((cat, i) => (
                                    <option key={i} value={Object.keys(t('automationRules.categories', {}))[i]}>{cat as string}</option>
                                ))}
                            </select>
                             <select {...register('triggerType')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                <option value="on_lead_creation">On Lead Creation</option>
                                <option value="on_status_change">On Status Change</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Conditions (IF ALL)</h2>
                    <div className="space-y-3">
                        {conditionFields.map((field, index) => (
                            <ConditionRow key={field.id} control={control} index={index} onRemove={() => removeCondition(index)} />
                        ))}
                    </div>
                    <button type="button" onClick={() => appendCondition({ id: `cond_${Date.now()}`, field: 'lead_status', operator: 'is', value: 'new' })} className="mt-4 text-sm text-blue-600">+ Add Condition</button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Actions (THEN)</h2>
                    <div className="space-y-3">
                        {actionFields.map((field, index) => (
                           <ActionRow key={field.id} control={control} index={index} templates={templates} onRemove={() => removeAction(index)} />
                        ))}
                    </div>
                    <button type="button" onClick={() => appendAction({ id: `act_${Date.now()}`, type: 'send_email', templateId: '' })} className="mt-4 text-sm text-blue-600">+ Add Action</button>
                </div>
                
                 <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/crm/automation-rules')} className="px-6 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
                    <button type="button" onClick={() => setIsTesterOpen(true)} className="px-6 py-2 bg-yellow-500 text-white rounded-md">Test Rule</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md">Save Rule</button>
                </div>
            </form>
            
            {isTesterOpen && (
                <RuleTesterModal
                    isOpen={isTesterOpen}
                    onClose={() => setIsTesterOpen(false)}
                    rule={getValues()}
                />
            )}
        </>
    );
};

export default RuleBuilder;