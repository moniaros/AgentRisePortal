import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
// FIX: Correct import path for types
import { ConditionField, ConditionOperator, LeadStatus, PolicyType } from '../../../types';

interface ConditionRowProps {
    control: any;
    index: number;
    onRemove: () => void;
}

const CONDITION_FIELDS: { label: string; value: ConditionField; type: 'enum' | 'number' }[] = [
    { label: 'Lead Status', value: 'lead_status', type: 'enum' },
    { label: 'Lead Score', value: 'lead_score', type: 'number' },
    { label: 'Policy Interest', value: 'policy_interest', type: 'enum' },
];

const OPERATORS: Record<string, { label: string; value: ConditionOperator }[]> = {
    enum: [
        { label: 'Is', value: 'is' },
        { label: 'Is Not', value: 'is_not' },
    ],
    number: [
        { label: 'Is Equal To', value: 'equals' },
        { label: 'Is Greater Than', value: 'greater_than' },
        { label: 'Is Less Than', value: 'less_than' },
    ]
};

// FIX: Used LeadStatus enum members instead of string literals to conform to the `LeadStatus[]` type.
const leadStatusValues: LeadStatus[] = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.CLOSED, LeadStatus.REJECTED];

const VALUE_OPTIONS: Record<string, { label: string; value: string }[]> = {
    lead_status: leadStatusValues.map(s => ({label: s, value: s})),
    // FIX: With `PolicyType` correctly defined as a string enum, this mapping now works as expected without type errors.
    policy_interest: Object.values(PolicyType).map(p => ({label: p, value: p})),
};


const ConditionRow: React.FC<ConditionRowProps> = ({ control, index, onRemove }) => {
    const { watch } = useFormContext();
    const fieldType = watch(`conditions.${index}.field`);
    const selectedField = CONDITION_FIELDS.find(f => f.value === fieldType);

    return (
        <div className="flex items-center gap-2 p-2 border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
            <Controller
                name={`conditions.${index}.field`}
                control={control}
                render={({ field }) => (
                    <select {...field} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        {CONDITION_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                )}
            />
            <Controller
                name={`conditions.${index}.operator`}
                control={control}
                render={({ field }) => (
                    <select {...field} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        {selectedField && OPERATORS[selectedField.type].map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                )}
            />
            
            {selectedField?.type === 'number' ? (
                 <Controller
                    name={`conditions.${index}.value`}
                    control={control}
                    render={({ field }) => (
                        <input type="number" {...field} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 w-full" />
                    )}
                />
            ) : (
                <Controller
                    name={`conditions.${index}.value`}
                    control={control}
                    render={({ field }) => (
                         <select {...field} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 w-full capitalize">
                            {(VALUE_OPTIONS[selectedField?.value as string] || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    )}
                />
            )}
           
            <button type="button" onClick={onRemove} className="text-red-500 font-bold text-lg px-2">&times;</button>
        </div>
    );
};

export default ConditionRow;
