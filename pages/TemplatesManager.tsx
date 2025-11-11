import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useTemplates } from '../hooks/useTemplates';
import { MessageTemplate, TemplateChannel } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import TemplateEditorModal from '../components/automation/templates/TemplateEditorModal';

const TemplatesManager: React.FC = () => {
    const { t } = useLocalization();
    const { templates, isLoading, error, addTemplate, updateTemplate, deleteTemplate } = useTemplates();

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

    const groupedTemplates = useMemo(() => {
        const groups: Record<TemplateChannel, MessageTemplate[]> = {
            email: [],
            sms: [],
            viber: [],
            whatsapp: [],
        };
        templates.forEach(t => {
            if (groups[t.channel]) {
                groups[t.channel].push(t);
            }
        });
        return groups;
    }, [templates]);

    const handleCreate = () => {
        setEditingTemplate(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (template: MessageTemplate) => {
        setEditingTemplate(template);
        setIsEditorOpen(true);
    };

    const handleSave = (template: MessageTemplate) => {
        if (editingTemplate) {
            updateTemplate(template);
        } else {
            addTemplate(template);
        }
        setIsEditorOpen(false);
    };

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    const TemplateList: React.FC<{ channel: TemplateChannel, channelTemplates: MessageTemplate[] }> = ({ channel, channelTemplates }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 capitalize">{t(`automationRules.templates.channels.${channel}`)}</h3>
            {channelTemplates.length > 0 ? (
                <ul className="space-y-2">
                    {channelTemplates.map(template => (
                        <li key={template.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <span className="text-sm font-medium">{template.name}</span>
                            <div className="space-x-2">
                                <button onClick={() => handleEdit(template)} className="text-sm text-blue-500 hover:underline">{t('common.edit')}</button>
                                <button onClick={() => deleteTemplate(template.id)} className="text-sm text-red-500 hover:underline">{t('common.delete')}</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500">{t('automationRules.templates.noTemplates')}</p>
            )}
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('automationRules.templates.title')}</h2>
                <button onClick={handleCreate} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    {t('automationRules.templates.create')}
                </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">{t('automationRules.templates.description')}</p>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SkeletonLoader className="h-48 w-full" />
                    <SkeletonLoader className="h-48 w-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(Object.keys(groupedTemplates) as TemplateChannel[]).map(channel => (
                        <TemplateList key={channel} channel={channel} channelTemplates={groupedTemplates[channel]} />
                    ))}
                </div>
            )}

            {isEditorOpen && (
                <TemplateEditorModal
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSave}
                    template={editingTemplate}
                />
            )}
        </div>
    );
};

export default TemplatesManager;
