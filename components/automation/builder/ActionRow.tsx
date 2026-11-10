import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { ActionType, MessageTemplate, TemplateChannel } from '../../../types';

interface ActionRowProps {
    control: any;
    index: number;
    templates: MessageTemplate[];
    onRemove: () => void;
}

const ACTION_TYPES: { label: string; value: ActionType }[] = [
    { label: 'Send Email', value: 'send_email' },
    { label: 'Send SMS', value: 'send_sms' },
    { label: 'Send Viber Business', value: 'send_viber' },
    { label: 'Send WhatsApp', value: 'send_whatsapp' },
    { label: 'Create SLA Follow-Up Task', value: 'create_task' },
    { label: 'Auto-Create Pipeline Opportunity', value: 'create_opportunity' },
];

const ActionRow: React.FC<ActionRowProps> = ({ control, index, templates, onRemove }) => {
    const actionType = useWatch({
        control,
        name: `actions.${index}.type`,
    }) as ActionType;

    const getTemplateTypeKey = (type: ActionType): TemplateChannel | '' => {
        switch (type) {
            case 'send_email':
                return 'email';
            case 'send_sms':
                return 'sms';
            case 'send_viber':
                return 'viber';
            case 'send_whatsapp':
                return 'whatsapp';
            default:
                return '';
        }
    };

    const templateTypeKey = getTemplateTypeKey(actionType);
    const currentTemplates = templates.filter((t) => t.channel === templateTypeKey);

    return (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <Controller
                name={`actions.${index}.type`}
                control={control}
                render={({ field }) => (
                    <select
                        {...field}
                        aria-label={`Action ${index + 1} type`}
                        className="p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 dark:text-white"
                    >
                        {ACTION_TYPES.map((a) => (
                            <option key={a.value} value={a.value}>
                                {a.label}
                            </option>
                        ))}
                    </select>
                )}
            />

            {templateTypeKey ? (
                <>
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">with template</span>
                    <Controller
                        name={`actions.${index}.templateId`}
                        control={control}
                        render={({ field }) => (
                            <select
                                {...field}
                                aria-label={`Action ${index + 1} template`}
                                className="p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 dark:text-white w-full"
                            >
                                <option value="">Select a template...</option>
                                {currentTemplates.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    />
                </>
            ) : actionType === 'create_task' ? (
                <Controller
                    name={`actions.${index}.taskTitle`}
                    control={control}
                    render={({ field }) => (
                        <input
                            type="text"
                            {...field}
                            value={field.value || ''}
                            placeholder="Task title (e.g. Call High-Value Home Lead within 15m)"
                            aria-label={`Action ${index + 1} task title`}
                            className="p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 dark:text-white w-full"
                        />
                    )}
                />
            ) : (
                <span className="text-xs text-slate-600 dark:text-slate-300 px-2 w-full">
                    Automatically creates a Prospect &amp; Deal card in Stage &ldquo;New&rdquo; on the Kanban board.
                </span>
            )}

            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove action ${index + 1}`}
                className="text-red-600 hover:text-red-700 font-bold text-lg px-2"
            >
                &times;
            </button>
        </div>
    );
};

export default ActionRow;