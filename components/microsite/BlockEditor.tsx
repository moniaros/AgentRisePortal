import React, { useState } from 'react';
import { MicrositeBlock, Product, Testimonial, FaqItem } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { GoogleGenAI } from '@google/genai';
import { ICONS } from '../../constants';

interface BlockEditorProps {
    block: MicrositeBlock;
    onUpdate: (updatedBlock: MicrositeBlock) => void;
}

const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const LabeledInput: React.FC<{ label: string; name: string; value: string; onUpdate: (name: string, value: string) => void; onAiGenerate?: () => void; isAiLoading?: boolean; type?: 'input' | 'textarea' }> = ({ label, name, value, onUpdate, onAiGenerate, isAiLoading, type = 'input' }) => {
    const { t } = useLocalization();
    const Component = type === 'input' ? 'input' : 'textarea';
    
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="relative mt-1">
                 <Component
                    name={name}
                    value={value}
                    onChange={(e) => onUpdate(name, e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 pr-10"
                    rows={type === 'textarea' ? 3 : undefined}
                />
                {onAiGenerate && (
                    <button
                        type="button"
                        onClick={onAiGenerate}
                        disabled={isAiLoading}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-500 hover:text-purple-700 disabled:opacity-50"
                        title={t('micrositeBuilder.editor.generateWithAi') as string}
                    >
                        {isAiLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
                        ) : (
                           React.cloneElement(ICONS.magic, { className: "h-5 w-5" })
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};


const BlockEditor: React.FC<BlockEditorProps> = ({ block, onUpdate }) => {
    const { t } = useLocalization();
    const [isAiLoading, setIsAiLoading] = useState<string | null>(null);

    const handleAiGenerate = async (field: string, context?: any) => {
        if (!process.env.API_KEY) {
            alert("API Key not configured.");
            return;
        }
        setIsAiLoading(field);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let prompt = '';

            switch (block.type) {
                case 'hero':
                    if (field === 'title') prompt = `Generate a short, compelling hero banner title for an insurance agent's website. Max 5 words. Examples: "Your Trusted Insurance Partner", "Protecting Your Tomorrow, Today".`;
                    if (field === 'subtitle') prompt = `Generate a supportive subtitle for a hero banner with the title "${block.title}". Explain the agent's value proposition. Max 15 words.`;
                    break;
                case 'products':
                     if (field.startsWith('description-')) prompt = `Write a clear, one-sentence description for an insurance product named "${context.productName}". Focus on the main benefit for the customer.`;
                    break;
                case 'testimonials':
                    if (field === 'quote') prompt = `Write a short, positive testimonial quote for a fictional insurance agent that sounds authentic. Focus on great customer service or peace of mind.`;
                    break;
                case 'faq':
                    if (field.startsWith('answer-')) prompt = `Provide a clear and simple answer to the frequently asked question: "${context.question}". The tone should be helpful and professional for an insurance agency website.`;
                    break;
            }
            
            if (!prompt) return;

            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            const generatedText = response.text.trim().replace(/^"|"$/g, ''); // Remove quotes

            if (field.includes('-')) {
                const [fieldName, indexStr] = field.split('-');
                const index = parseInt(indexStr, 10);
                const arrayName = fieldName === 'answer' ? 'items' : block.type;
                const array = (block as any)[arrayName];
                const newArray = array.map((item: any, i: number) => i === index ? { ...item, [fieldName]: generatedText } : item);
                onUpdate({ ...block, [arrayName]: newArray } as MicrositeBlock);
            } else {
                onUpdate({ ...block, [field]: generatedText } as MicrositeBlock);
            }

        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Failed to generate content with AI.");
        } finally {
            setIsAiLoading(null);
        }
    };
    
    const handleChange = (name: string, value: string) => {
        onUpdate({ ...block, [name]: value });
    };

    const handleNestedChange = <T,>(
        arrayName: string,
        index: number,
        name: string,
        value: string
    ) => {
        const array = (block as any)[arrayName] as T[];
        const newArray = array.map((item, i) => i === index ? { ...item, [name]: value } : item);
        onUpdate({ ...block, [arrayName]: newArray } as MicrositeBlock);
    };
    
    const addNestedItem = (arrayName: 'products' | 'testimonials' | 'items') => {
        let newItem: Product | Testimonial | FaqItem;
        switch (arrayName) {
            case 'products':
                newItem = { id: generateId('prod'), name: '', description: '' };
                break;
            case 'testimonials':
                newItem = { id: generateId('test'), quote: '', author: '' };
                break;
            case 'items':
                newItem = { id: generateId('faq'), question: '', answer: '' };
                break;
        }
        onUpdate({ ...block, [arrayName]: [...(block as any)[arrayName], newItem] } as MicrositeBlock);
    };
    
    const removeNestedItem = (arrayName: string, index: number) => {
        const array = (block as any)[arrayName];
        onUpdate({ ...block, [arrayName]: array.filter((_: any, i: number) => i !== index) } as MicrositeBlock);
    };

    switch (block.type) {
        case 'hero':
            return (
                <div className="space-y-3">
                    <LabeledInput label={t('micrositeBuilder.editor.title')} name="title" value={block.title} onUpdate={handleChange} onAiGenerate={() => handleAiGenerate('title')} isAiLoading={isAiLoading === 'title'} />
                    <LabeledInput label={t('micrositeBuilder.editor.subtitle')} name="subtitle" value={block.subtitle} onUpdate={handleChange} onAiGenerate={() => handleAiGenerate('subtitle')} isAiLoading={isAiLoading === 'subtitle'} />
                    <LabeledInput label={t('micrositeBuilder.editor.cta')} name="ctaText" value={block.ctaText} onUpdate={handleChange} />
                </div>
            );
        case 'products':
            return (
                <div className="space-y-4">
                    <LabeledInput label={t('micrositeBuilder.editor.title')} name="title" value={block.title} onUpdate={handleChange} />
                    {block.products.map((product, index) => (
                        <div key={product.id} className="p-3 border rounded-md dark:border-gray-600 space-y-2 relative">
                            <button onClick={() => removeNestedItem('products', index)} className="absolute top-2 right-2 text-red-500 font-bold">&times;</button>
                            <LabeledInput label={t('micrositeBuilder.editor.productName')} name="name" value={product.name} onUpdate={(name, value) => handleNestedChange('products', index, name, value)} />
                            <LabeledInput label={t('micrositeBuilder.editor.productDescription')} name="description" value={product.description} onUpdate={(name, value) => handleNestedChange('products', index, name, value)} type="textarea" onAiGenerate={() => handleAiGenerate(`description-${index}`, { productName: product.name })} isAiLoading={isAiLoading === `description-${index}`} />
                        </div>
                    ))}
                    <button onClick={() => addNestedItem('products')} className="text-sm text-blue-500">+ {t('micrositeBuilder.editor.addProduct')}</button>
                </div>
            );
        case 'testimonials':
            return (
                 <div className="space-y-4">
                    <LabeledInput label={t('micrositeBuilder.editor.title')} name="title" value={block.title} onUpdate={handleChange} />
                    {block.testimonials.map((testimonial, index) => (
                        <div key={testimonial.id} className="p-3 border rounded-md dark:border-gray-600 space-y-2 relative">
                             <button onClick={() => removeNestedItem('testimonials', index)} className="absolute top-2 right-2 text-red-500 font-bold">&times;</button>
                            <LabeledInput label={t('micrositeBuilder.editor.testimonialQuote')} name="quote" value={testimonial.quote} onUpdate={(name, value) => handleNestedChange('testimonials', index, name, value)} type="textarea" onAiGenerate={() => handleAiGenerate('quote')} isAiLoading={isAiLoading === 'quote'} />
                            <LabeledInput label={t('micrositeBuilder.editor.testimonialAuthor')} name="author" value={testimonial.author} onUpdate={(name, value) => handleNestedChange('testimonials', index, name, value)} />
                        </div>
                    ))}
                    <button onClick={() => addNestedItem('testimonials')} className="text-sm text-blue-500">+ {t('micrositeBuilder.editor.addTestimonial')}</button>
                </div>
            );
         case 'faq':
            return (
                 <div className="space-y-4">
                    <LabeledInput label={t('micrositeBuilder.editor.title')} name="title" value={block.title} onUpdate={handleChange} />
                    {block.items.map((item, index) => (
                        <div key={item.id} className="p-3 border rounded-md dark:border-gray-600 space-y-2 relative">
                            <button onClick={() => removeNestedItem('items', index)} className="absolute top-2 right-2 text-red-500 font-bold">&times;</button>
                            <LabeledInput label={t('micrositeBuilder.editor.faqQuestion')} name="question" value={item.question} onUpdate={(name, value) => handleNestedChange('items', index, name, value)} />
                            <LabeledInput label={t('micrositeBuilder.editor.faqAnswer')} name="answer" value={item.answer} onUpdate={(name, value) => handleNestedChange('items', index, name, value)} type="textarea" onAiGenerate={() => handleAiGenerate(`answer-${index}`, { question: item.question })} isAiLoading={isAiLoading === `answer-${index}`} />
                        </div>
                    ))}
                    <button onClick={() => addNestedItem('items')} className="text-sm text-blue-500">+ {t('micrositeBuilder.editor.addFaq')}</button>
                </div>
            );
        case 'contact':
            return (
                <div className="space-y-3">
                    <LabeledInput label={t('micrositeBuilder.editor.title')} name="title" value={block.title} onUpdate={handleChange} />
                    <LabeledInput label={t('micrositeBuilder.editor.subtitle')} name="subtitle" value={block.subtitle} onUpdate={handleChange} />
                </div>
            );
        default:
            return null;
    }
};

export default BlockEditor;