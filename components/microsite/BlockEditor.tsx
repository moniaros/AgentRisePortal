import React from 'react';
import { MicrositeBlock, HeroBlock, AboutBlock, ServicesBlock, ServiceItem, AwardsBlock, AwardItem, TestimonialsBlock, TestimonialItem, NewsBlock, NewsItem, ContactBlock } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface BlockEditorProps {
    block: MicrositeBlock;
    onUpdate: (updatedBlock: MicrositeBlock) => void;
}

const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const BlockEditor: React.FC<BlockEditorProps> = ({ block, onUpdate }) => {
    const { t } = useLocalization();

    const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate({ ...block, [e.target.name]: e.target.value });
    };

    const handleNestedChange = (index: number, field: string, value: string, arrayName: string) => {
        const items = (block as any)[arrayName];
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onUpdate({ ...block, [arrayName]: newItems });
    };

    const addNestedItem = (arrayName: string, newItem: object) => {
        const items = (block as any)[arrayName] || [];
        onUpdate({ ...block, [arrayName]: [...items, { ...newItem, id: generateId() }] });
    };

    const removeNestedItem = (index: number, arrayName: string) => {
        const items = (block as any)[arrayName];
        onUpdate({ ...block, [arrayName]: items.filter((_: any, i: number) => i !== index) });
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

     const LabeledTextarea: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number }> = ({ label, name, value, onChange, rows=3 }) => (
        <div>
            <label className="block text-sm font-medium">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
        </div>
    );

    if (block.isLoading) {
        return <p className="text-sm text-gray-500">{t('micrositeBuilder.generatingAiContent')}</p>;
    }

    const renderHeroEditor = (b: HeroBlock) => (
        <div className="space-y-4">
            <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
            <LabeledInput label="Subtitle" name="subtitle" value={b.subtitle} onChange={(e) => onUpdate({ ...b, subtitle: e.target.value })} />
            <LabeledInput label="CTA Button Text" name="ctaText" value={b.ctaText} onChange={(e) => onUpdate({ ...b, ctaText: e.target.value })} />
        </div>
    );

    const renderAboutEditor = (b: AboutBlock) => (
        <div className="space-y-4">
            <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
            <LabeledTextarea label={t('micrositeBuilder.editor.content')} name="content" value={b.content} onChange={(e) => onUpdate({...b, content: e.target.value})} rows={5} />
            <LabeledInput label={t('micrositeBuilder.editor.imageUrl')} name="imageUrl" value={b.imageUrl} onChange={(e) => onUpdate({...b, imageUrl: e.target.value})} />
        </div>
    );

    const renderServicesEditor = (b: ServicesBlock) => (
        <div className="space-y-4">
            <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
            {b.services.map((p, i) => (
                <div key={p.id} className="p-2 border rounded space-y-2 dark:border-gray-600">
                    <input value={p.name} onChange={(e) => handleNestedChange(i, 'name', e.target.value, 'services')} placeholder={t('micrositeBuilder.editor.serviceName')} className="w-full p-1 border rounded dark:bg-gray-600"/>
                    <textarea value={p.description} onChange={(e) => handleNestedChange(i, 'description', e.target.value, 'services')} placeholder={t('micrositeBuilder.editor.serviceDescription')} className="w-full p-1 border rounded dark:bg-gray-600"/>
                    <button onClick={() => removeNestedItem(i, 'services')} className="text-xs text-red-500">{t('micrositeBuilder.editor.remove')}</button>
                </div>
            ))}
            <button onClick={() => addNestedItem('services', { name: '', description: '' })} className="text-sm text-blue-500">+ {t('micrositeBuilder.editor.addService')}</button>
        </div>
    );
    
    const renderAwardsEditor = (b: AwardsBlock) => (
        <div className="space-y-4">
            <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
            {b.awards.map((item, i) => (
                <div key={item.id} className="p-2 border rounded space-y-2 dark:border-gray-600">
                    <input value={item.title} onChange={(e) => handleNestedChange(i, 'title', e.target.value, 'awards')} placeholder={t('micrositeBuilder.editor.awardTitle')} className="w-full p-1 border rounded dark:bg-gray-600"/>
                    <input value={item.issuer} onChange={(e) => handleNestedChange(i, 'issuer', e.target.value, 'awards')} placeholder={t('micrositeBuilder.editor.awardIssuer')} className="w-full p-1 border rounded dark:bg-gray-600"/>
                    <input value={item.year} onChange={(e) => handleNestedChange(i, 'year', e.target.value, 'awards')} placeholder={t('micrositeBuilder.editor.awardYear')} className="w-full p-1 border rounded dark:bg-gray-600"/>
                    <button onClick={() => removeNestedItem(i, 'awards')} className="text-xs text-red-500">{t('micrositeBuilder.editor.remove')}</button>
                </div>
            ))}
            <button onClick={() => addNestedItem('awards', { title: '', issuer: '', year: '' })} className="text-sm text-blue-500">+ {t('micrositeBuilder.editor.addAward')}</button>
        </div>
    );
    
    const renderTestimonialsEditor = (b: TestimonialsBlock) => (
         <div className="space-y-4">
            <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
            {b.testimonials.map((item, i) => (
                <div key={item.id} className="p-2 border rounded space-y-2 dark:border-gray-600">
                    <textarea value={item.quote} onChange={(e) => handleNestedChange(i, 'quote', e.target.value, 'testimonials')} placeholder={t('micrositeBuilder.editor.quote')} className="w-full p-1 border rounded dark:bg-gray-600"/>
                    <input value={item.author} onChange={(e) => handleNestedChange(i, 'author', e.target.value, 'testimonials')} placeholder={t('micrositeBuilder.editor.author')} className="w-full p-1 border rounded dark:bg-gray-600"/>
                    <button onClick={() => removeNestedItem(i, 'testimonials')} className="text-xs text-red-500">{t('micrositeBuilder.editor.remove')}</button>
                </div>
            ))}
            <button onClick={() => addNestedItem('testimonials', { quote: '', author: '' })} className="text-sm text-blue-500">+ {t('micrositeBuilder.editor.addTestimonial')}</button>
        </div>
    );
    
    const renderNewsEditor = (b: NewsBlock) => (
        <div className="space-y-4">
           <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
           {b.items.map((item, i) => (
               <div key={item.id} className="p-2 border rounded space-y-2 dark:border-gray-600">
                   <input value={item.title} onChange={(e) => handleNestedChange(i, 'title', e.target.value, 'items')} placeholder={t('micrositeBuilder.editor.newsTitle')} className="w-full p-1 border rounded dark:bg-gray-600"/>
                   <input type="date" value={item.date} onChange={(e) => handleNestedChange(i, 'date', e.target.value, 'items')} placeholder={t('micrositeBuilder.editor.newsDate')} className="w-full p-1 border rounded dark:bg-gray-600"/>
                   <textarea value={item.summary} onChange={(e) => handleNestedChange(i, 'summary', e.target.value, 'items')} placeholder={t('micrositeBuilder.editor.newsSummary')} className="w-full p-1 border rounded dark:bg-gray-600"/>
                   <button onClick={() => removeNestedItem(i, 'items')} className="text-xs text-red-500">{t('micrositeBuilder.editor.remove')}</button>
               </div>
           ))}
           <button onClick={() => addNestedItem('items', { title: '', date: '', summary: '' })} className="text-sm text-blue-500">+ {t('micrositeBuilder.editor.addNews')}</button>
       </div>
   );

    const renderContactEditor = (b: ContactBlock) => (
        <div className="space-y-4">
            <LabeledInput label="Title" name="title" value={b.title} onChange={handleCommonChange} />
            <LabeledInput label="Subtitle" name="subtitle" value={b.subtitle} onChange={(e) => onUpdate({ ...b, subtitle: e.target.value })} />
        </div>
    );

    switch (block.type) {
        case 'hero': return renderHeroEditor(block);
        case 'about': return renderAboutEditor(block);
        case 'services': return renderServicesEditor(block);
        case 'awards': return renderAwardsEditor(block);
        case 'testimonials': return renderTestimonialsEditor(block);
        case 'news': return renderNewsEditor(block);
        case 'contact': return renderContactEditor(block);
        default: return <p>Unknown block type.</p>;
    }
};

export default BlockEditor;