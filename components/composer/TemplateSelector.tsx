import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface Template {
    title: string;
    content: string;
}

interface TemplateSelectorProps {
    onSelectTemplate: (content: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate }) => {
    const { t } = useLocalization();
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const templates = t('socialComposer.templates') as unknown as Template[];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const content = e.target.value;
        setSelectedTemplate(content);
        if (content) {
            onSelectTemplate(content);
        }
    };

    return (
        <div>
            <label htmlFor="template-selector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('socialComposer.templatesTitle')}
            </label>
            <select
                id="template-selector"
                value={selectedTemplate}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Select a template...</option>
                {Array.isArray(templates) && templates.map((template, index) => (
                    <option key={index} value={template.content}>
                        {template.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TemplateSelector;
