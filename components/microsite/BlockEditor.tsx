import React from 'react';
import { MicrositeBlock, HeroBlock, ProductsBlock, ProductItem, TestimonialsBlock, TestimonialItem, FaqBlock, FaqItem, ContactBlock } from '../../types';

interface BlockEditorProps {
    block: MicrositeBlock;
    onUpdate: (updatedBlock: MicrositeBlock) => void;
}

const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const BlockEditor: React.FC<BlockEditorProps> = ({ block, onUpdate }) => {

    const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({ ...block, [e.target.name]: e.target.value });
    };
    
    const LabeledInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange }) => (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
        </div>
    );

    const renderHeroEditor = (b: HeroBlock) => (
        <div className="space-y-4">
            <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
            <LabeledInput label="Subtitle" name="subtitle" value={b.subtitle} onChange={(e) => onUpdate({ ...b, subtitle: e.target.value })} />
            <LabeledInput label="CTA Button Text" name="ctaText" value={b.ctaText} onChange={(e) => onUpdate({ ...b, ctaText: e.target.value })} />
        </div>
    );

    const renderProductsEditor = (b: ProductsBlock) => {
        const handleProductChange = (index: number, field: keyof ProductItem, value: string) => {
            const newProducts = [...b.products];
            newProducts[index] = { ...newProducts[index], [field]: value };
            onUpdate({ ...b, products: newProducts });
        };
        const addProduct = () => {
            onUpdate({ ...b, products: [...b.products, { id: generateId(), name: '', description: '' }] });
        };
        const removeProduct = (index: number) => {
            onUpdate({ ...b, products: b.products.filter((_, i) => i !== index) });
        };
        return (
            <div className="space-y-4">
                <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
                {b.products.map((p, i) => (
                    <div key={p.id} className="p-2 border rounded space-y-2">
                        <input value={p.name} onChange={(e) => handleProductChange(i, 'name', e.target.value)} placeholder="Product Name" className="w-full p-1 border rounded dark:bg-gray-600"/>
                        <textarea value={p.description} onChange={(e) => handleProductChange(i, 'description', e.target.value)} placeholder="Description" className="w-full p-1 border rounded dark:bg-gray-600"/>
                        <button onClick={() => removeProduct(i)} className="text-xs text-red-500">Remove</button>
                    </div>
                ))}
                <button onClick={addProduct} className="text-sm text-blue-500">+ Add Product</button>
            </div>
        );
    };
    
    const renderTestimonialsEditor = (b: TestimonialsBlock) => {
        const handleItemChange = (index: number, field: keyof TestimonialItem, value: string) => {
            const newItems = [...b.testimonials];
            newItems[index] = { ...newItems[index], [field]: value };
            onUpdate({ ...b, testimonials: newItems });
        };
        const addItem = () => {
            onUpdate({ ...b, testimonials: [...b.testimonials, { id: generateId(), quote: '', author: '' }] });
        };
        const removeItem = (index: number) => {
            onUpdate({ ...b, testimonials: b.testimonials.filter((_, i) => i !== index) });
        };
        return (
             <div className="space-y-4">
                <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
                {b.testimonials.map((item, i) => (
                    <div key={item.id} className="p-2 border rounded space-y-2">
                        <textarea value={item.quote} onChange={(e) => handleItemChange(i, 'quote', e.target.value)} placeholder="Quote" className="w-full p-1 border rounded dark:bg-gray-600"/>
                        <input value={item.author} onChange={(e) => handleItemChange(i, 'author', e.target.value)} placeholder="Author" className="w-full p-1 border rounded dark:bg-gray-600"/>
                        <button onClick={() => removeItem(i)} className="text-xs text-red-500">Remove</button>
                    </div>
                ))}
                <button onClick={addItem} className="text-sm text-blue-500">+ Add Testimonial</button>
            </div>
        );
    };
    
    const renderFaqEditor = (b: FaqBlock) => {
        const handleItemChange = (index: number, field: keyof FaqItem, value: string) => {
            const newItems = [...b.items];
            newItems[index] = { ...newItems[index], [field]: value };
            onUpdate({ ...b, items: newItems });
        };
        const addItem = () => {
            onUpdate({ ...b, items: [...b.items, { id: generateId(), question: '', answer: '' }] });
        };
        const removeItem = (index: number) => {
            onUpdate({ ...b, items: b.items.filter((_, i) => i !== index) });
        };
        return (
             <div className="space-y-4">
                <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
                {b.items.map((item, i) => (
                    <div key={item.id} className="p-2 border rounded space-y-2">
                        <input value={item.question} onChange={(e) => handleItemChange(i, 'question', e.target.value)} placeholder="Question" className="w-full p-1 border rounded dark:bg-gray-600"/>
                        <textarea value={item.answer} onChange={(e) => handleItemChange(i, 'answer', e.target.value)} placeholder="Answer" className="w-full p-1 border rounded dark:bg-gray-600"/>
                        <button onClick={() => removeItem(i)} className="text-xs text-red-500">Remove</button>
                    </div>
                ))}
                <button onClick={addItem} className="text-sm text-blue-500">+ Add FAQ Item</button>
            </div>
        );
    };

    const renderContactEditor = (b: ContactBlock) => (
        <div className="space-y-4">
            <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
            <LabeledInput label="Subtitle" name="subtitle" value={b.subtitle} onChange={(e) => onUpdate({ ...b, subtitle: e.target.value })} />
        </div>
    );

    switch (block.type) {
        case 'hero': return renderHeroEditor(block);
        case 'products': return renderProductsEditor(block);
        case 'testimonials': return renderTestimonialsEditor(block);
        case 'faq': return renderFaqEditor(block);
        case 'contact': return renderContactEditor(block);
        default: return <p>Unknown block type.</p>;
    }
};

export default BlockEditor;
