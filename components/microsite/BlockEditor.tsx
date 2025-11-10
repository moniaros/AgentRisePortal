import React from 'react';
import { MicrositeBlock, Product, Testimonial, FaqItem } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface BlockEditorProps {
    block: MicrositeBlock;
    onUpdate: (updatedBlock: MicrositeBlock) => void;
}

const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const LabeledInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input {...props} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
    </div>
);

const BlockEditor: React.FC<BlockEditorProps> = ({ block, onUpdate }) => {
    const { t } = useLocalization();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate({ ...block, [e.target.name]: e.target.value });
    };

    // FIX: Changed arrayName type from `keyof MicrositeBlock` to `string` to allow for dynamic property access
    // on different block types (e.g., 'products', 'testimonials').
    const handleNestedChange = <T,>(
        arrayName: string,
        index: number,
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
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
    
    // FIX: Changed arrayName type from `keyof MicrositeBlock` to `string` for the same reason as handleNestedChange.
    const removeNestedItem = (arrayName: string, index: number) => {
        const array = (block as any)[arrayName];
        onUpdate({ ...block, [arrayName]: array.filter((_: any, i: number) => i !== index) } as MicrositeBlock);
    };

    switch (block.type) {
        case 'hero':
            return (
                <div className="space-y-3">
                    <LabeledInput label={t('micrositeBuilder.editor.title')} name="title" value={block.title} onChange={handleChange} />
                    <LabeledInput label={t('micrositeBuilder.editor.subtitle')} name="subtitle" value={block.subtitle} onChange={handleChange} />
                    <LabeledInput label={t('micrositeBuilder.editor.cta')} name="ctaText" value={block.ctaText} onChange={handleChange} />
                </div>
            );
        case 'products':
            return (
                <div className="space-y-4">
                    <LabeledInput label={t('micrositeBuilder.editor.title')} name="title" value={block.title} onChange={handleChange} />
                    {block.products.map((product, index) => (
                        <div key={product.id} className="p-3 border rounded-md dark:border-gray-600 space-y-2 relative">
                            <button onClick={() => removeNestedItem('products', index)} className="absolute top-2 right-2 text-red-500 font-bold">&times;</button>
                            <input name="name" value={product.name} onChange={(e) => handleNestedChange('products', index, e)} placeholder={t('micrositeBuilder.editor.productName')} className="w-full p-2 border rounded dark:bg-gray-700" />
                            <textarea name="description" value={product.description} onChange={(e) => handleNestedChange('products', index, e)} placeholder={t('micrositeBuilder.editor.productDescription')} className="w-full p-2 border rounded dark:bg-gray-700" rows={2} />
                        </div>
                    ))}
                    <button onClick={() => addNestedItem('products')} className="text-sm text-blue-500">+ {t('micrositeBuilder.editor.addProduct')}</button>
                </div>
            );
        case 'testimonials':
            return (
                 <div className="space-y-4">
                    <LabeledInput label={t('micrositeBuilder.editor.title')} name="title" value={block.title} onChange={handleChange} />
                    {block.testimonials.map((testimonial, index) => (
                        <div key={testimonial.id} className="p-3 border rounded-md dark:border-gray-600 space-y-2 relative">
                             <button onClick={() => removeNestedItem('testimonials', index)} className="absolute top-2 right-2 text-red-500 font-bold">&times;</button>
                            <textarea name="quote" value={testimonial.quote} onChange={(e) => handleNestedChange('testimonials', index, e)} placeholder={t('micrositeBuilder.editor.testimonialQuote')} className="w-full p-2 border rounded dark:bg-gray-700" rows={3} />
                            <input name="author" value={testimonial.author} onChange={(e) => handleNestedChange('testimonials', index, e)} placeholder={t('micrositeBuilder.editor.testimonialAuthor')} className="w-full p-2 border rounded dark:bg-gray-700" />
                        </div>
                    ))}
                    <button onClick={() => addNestedItem('testimonials')} className="text-sm text-blue-500">+ {t('micrositeBuilder.editor.addTestimonial')}</button>
                </div>
            );
         case 'faq':
            return (
                 <div className="space-y-4">
                    <LabeledInput label={t('micrositeBuilder.editor.title')} name="title" value={block.title} onChange={handleChange} />
                    {block.items.map((item, index) => (
                        <div key={item.id} className="p-3 border rounded-md dark:border-gray-600 space-y-2 relative">
                            <button onClick={() => removeNestedItem('items', index)} className="absolute top-2 right-2 text-red-500 font-bold">&times;</button>
                            <input name="question" value={item.question} onChange={(e) => handleNestedChange('items', index, e)} placeholder={t('micrositeBuilder.editor.faqQuestion')} className="w-full p-2 border rounded dark:bg-gray-700" />
                            <textarea name="answer" value={item.answer} onChange={(e) => handleNestedChange('items', index, e)} placeholder={t('micrositeBuilder.editor.faqAnswer')} className="w-full p-2 border rounded dark:bg-gray-700" rows={2} />
                        </div>
                    ))}
                    <button onClick={() => addNestedItem('items')} className="text-sm text-blue-500">+ {t('micrositeBuilder.editor.addFaq')}</button>
                </div>
            );
        case 'contact':
            return (
                <div className="space-y-3">
                    <LabeledInput label={t('micrositeBuilder.editor.title')} name="title" value={block.title} onChange={handleChange} />
                    <LabeledInput label={t('micrositeBuilder.editor.subtitle')} name="subtitle" value={block.subtitle} onChange={handleChange} />
                </div>
            );
        default:
            return null;
    }
};

export default BlockEditor;