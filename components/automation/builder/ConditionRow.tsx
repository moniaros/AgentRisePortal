import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { ConditionField, ConditionOperator, LeadStatus, PolicyType } from '../../../types';

interface ConditionRowProps {
    control: any;
    index: number;
    onRemove: () => void;
}

const CONDITION_FIELDS: { label: string; value: ConditionField; type: 'enum' | 'number' | 'text' }[] = [
    { label: 'Lead Status', value: 'lead_status', type: 'enum' },
    { label: 'Lead Score', value: 'lead_score', type: 'number' },
    { label: 'Policy Interest', value: 'policy_interest', type: 'enum' },
    { label: 'Potential Annual Value (€)', value: 'potential_value', type: 'number' },
    { label: 'Lead Source', value: 'lead_source', type: 'text' },
    { label: 'Days Until Renewal', value: 'days_to_renewal', type: 'number' },
];

const OPERATORS: Record<string, { label: string; value: ConditionOperator }[]> = {
    enum: [
        { label: 'Is', value: 'is' },
        { label: 'Is Not', value: 'is_not' },
    ],
    number: [
        { label: 'Equals', value: 'equals' },
        { label: 'Greater Than', value: 'greater_than' },
        { label: 'Less Than', value: 'less_than' },
    ],
    text: [
        { label: 'Contains', value: 'contains' },
        { label: 'Is', value: 'is' },
        { label: 'Is Not', value: 'is_not' },
    ],
};

const leadStatusValues: LeadStatus[] = [
    LeadStatus.NEW,
    LeadStatus.CONTACTED,
    LeadStatus.QUALIFIED,
    LeadStatus.CLOSED,
    LeadStatus.REJECTED,
];

const VALUE_OPTIONS: Record<string, { label: string; value: string }[]> = {
    lead_status: leadStatusValues.map((s) => ({ label: s, value: s })),
    policy_interest: Object.values(PolicyType).map((p) => ({ label: p, value: p })),
};

const ConditionRow: React.FC<ConditionRowProps> = ({ control, index, onRemove }) => {
    const fieldType = useWatch({
        control,
        name: `conditions.${index}.field`,
    }) as ConditionField;
    const selectedField = CONDITION_FIELDS.find((f) => f.value === fieldType) || CONDITION_FIELDS[0];

    return (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <Controller
                name={`conditions.${index}.field`}
                control={control}
                render={({ field }) => (
                    <select
                        {...field}
                        aria-label={`Condition ${index + 1} field`}
                        className="p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 dark:text-white"
                    >
                        {CONDITION_FIELDS.map((f) => (
                            <option key={f.value} value={f.value}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                )}
            />
            <Controller
                name={`conditions.${index}.operator`}
                control={control}
                render={({ field }) => (
                    <select
                        {...field}
                        aria-label={`Condition ${index + 1} operator`}
                        className="p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 dark:text-white"
                    >
                        {(OPERATORS[selectedField.type] || OPERATORS.enum).map((op) => (
                            <option key={op.value} value={op.value}>
                                {op.label}
                            </option>
                        ))}
                    </select>
                )}
            />

            {selectedField.type === 'number' ? (
                <Controller
                    name={`conditions.${index}.value`}
                    control={control}
                    render={({ field }) => (
                        <input
                            type="number"
                            {...field}
                            aria-label={`Condition ${index + 1} numeric value`}
                            className="p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 dark:text-white w-full tabular-nums"
                        />
                    )}
                />
            ) : selectedField.type === 'text' ? (
                <Controller
                    name={`conditions.${index}.value`}
                    control={control}
                    render={({ field }) => (
                        <input
                            type="text"
                            {...field}
                            placeholder="e.g. Facebook, Campaign, Microsite"
                            aria-label={`Condition ${index + 1} text value`}
                            className="p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 dark:text-white w-full"
                        />
                    )}
                />
            ) : (
                <Controller
                    name={`conditions.${index}.value`}
                    control={control}
                    render={({ field }) => (
                        <select
                            {...field}
                            aria-label={`Condition ${index + 1} option value`}
                            className="p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 dark:text-white w-full capitalize"
                        >
                            {(VALUE_OPTIONS[selectedField.value] || []).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    )}
                />
            )}

            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove condition ${index + 1}`}
                className="text-red-600 hover:text-red-700 font-bold text-lg px-2"
            >
                &times;
            </button>
        </div>
    );
};

export default ConditionRow;
