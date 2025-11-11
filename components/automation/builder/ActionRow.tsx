import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { ActionType, MessageTemplate } from '../../../types';

interface ActionRowProps {
    control: any;
    index: number;
    templates: Record<string, MessageTemplate[]>;
    onRemove: () => void;
}

const ACTION_TYPES: { label: string; value: ActionType }[] = [
    { label: 'Send Email', value: 'send_email' },
    { label: 'Send SMS', value: 'send_sms' },
    { label: 'Send Viber', value: 'send_viber' },
    { label: 'Send WhatsApp', value: 'send_whatsapp' },
];

const ActionRow: React.FC<ActionRowProps> = ({ control, index, templates, onRemove }) => {
    const { watch } = useFormContext();
    const actionType = watch(`actions.${index}.type`);
    
    const getTemplateTypeKey = (type: ActionType) => {
        switch (type) {
            case 'send_email': return 'email';
            case 'send_sms': return 'sms';
            case 'send_viber': return 'viber';
            case 'send_whatsapp': return 'whatsapp';
            default: return '';
        }
    };
    
    const currentTemplates = templates[getTemplateTypeKey(actionType)] || [];

    return (
        <div className="flex items-center gap-2 p-2 border rounded dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
            <Controller
                name={`actions.${index}.type`}
                control={control}
                render={({ field }) => (
                    <select {...field} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                )}
            />
            <span className="text-sm">using template</span>
             <Controller
                name={`actions.${index}.templateId`}
                control={control}
                render={({ field }) => (
                     <select {...field} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 w-full">
                         <option value="">Select a template...</option>
                        {currentTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                )}
            />
            <button type="button" onClick={onRemove} className="text-red-500 font-bold text-lg px-2">&times;</button>
        </div>
    );
};

export default ActionRow;
