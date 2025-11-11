import React, { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLocalization } from '../../../hooks/useLocalization';
import { Language, MessageTemplate, TemplateChannel } from '../../../types';
import { TEMPLATE_PLACEHOLDERS, SAMPLE_DATA } from '../../../constants/placeholders';

interface TemplateEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: MessageTemplate) => void;
    template: MessageTemplate | null;
}

const defaultTemplate: Omit<MessageTemplate, 'id'> = {
    name: '',
    channel: 'email',
    content: '',
};

const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({ isOpen, onClose, onSave, template }) => {
    const { t } = useLocalization();
    const [previewLang, setPreviewLang] = React.useState<Language>(Language.EN);
    const contentRef = useRef<HTMLTextAreaElement | null>(null);

    const { register, handleSubmit, control, reset, watch } = useForm<MessageTemplate>({
        defaultValues: template || defaultTemplate,
    });
    
    const contentValue = watch('content');

    useEffect(() => {
        reset(template || defaultTemplate);
    }, [template, reset, isOpen]);
    
    if (!isOpen) return null;

    const onSubmit = (data: MessageTemplate) => {
        onSave({ ...template, ...data });
    };

    const insertPlaceholder = (value: string) => {
        if (contentRef.current) {
            const { selectionStart, selectionEnd, value: currentValue } = contentRef.current;
            const newValue = currentValue.substring(0, selectionStart) + value + currentValue.substring(selectionEnd);
            reset({ ...watch(), content: newValue });
            setTimeout(() => {
                contentRef.current?.focus();
                contentRef.current?.setSelectionRange(selectionStart + value.length, selectionStart + value.length);
            }, 0);
        }
    };
    
    const renderPreview = () => {
        let previewContent = contentValue;
        const data = SAMPLE_DATA[previewLang];
        
        previewContent = previewContent.replace(/\{\{Lead.FirstName\}\}/g, data.lead.firstName);
        previewContent = previewContent.replace(/\{\{Lead.LastName\}\}/g, data.lead.lastName);
        previewContent = previewContent.replace(/\{\{Lead.Score\}\}/g, String(data.lead.score));
        previewContent = previewContent.replace(/\{\{Agent.FirstName\}\}/g, data.agent.firstName);

        return <p className="text-sm whitespace-pre-wrap">{previewContent}</p>;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{template ? t('automationRules.templates.edit') : t('automationRules.templates.create')}</h2>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                    {/* Editor Column */}
                    <div className="space-y-4">
                        <input {...register('name', { required: true })} placeholder={t('automationRules.templates.form.namePlaceholder')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <Controller
                            name="channel"
                            control={control}
                            render={({ field }) => (
                                <select {...field} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 capitalize">
                                    {(Object.keys(t('automationRules.templates.channels', {})) as TemplateChannel[]).map(ch => (
                                        <option key={ch} value={ch}>{t(`automationRules.templates.channels.${ch}`)}</option>
                                    ))}
                                </select>
                            )}
                        />
                        <Controller
                            name="content"
                            control={control}
                            render={({ field }) => (
                                <textarea
                                    {...field}
                                    ref={contentRef}
                                    placeholder={t('automationRules.templates.form.content')}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 font-mono"
                                    rows={10}
                                />
                            )}
                        />
                    </div>
                    {/* Placeholders & Preview Column */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2">{t('automationRules.templates.form.placeholders')}</h3>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md border dark:border-gray-600">
                                {TEMPLATE_PLACEHOLDERS.map(p => (
                                    <button type="button" key={p.value} onClick={() => insertPlaceholder(p.value)} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded-full hover:bg-blue-200">
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">{t('automationRules.templates.form.preview')}</h3>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setPreviewLang(Language.EN)} className={`text-xs px-2 py-1 rounded ${previewLang === Language.EN ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>EN</button>
                                    <button type="button" onClick={() => setPreviewLang(Language.EL)} className={`text-xs px-2 py-1 rounded ${previewLang === Language.EL ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>EL</button>
                                </div>
                            </div>
                            <div className="p-4 border rounded dark:border-gray-600 min-h-[150px] bg-gray-50 dark:bg-gray-900/50">
                                {renderPreview()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('crm.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('crm.save')}</button>
                </div>
            </form>
        </div>
    );
};

export default TemplateEditorModal;
