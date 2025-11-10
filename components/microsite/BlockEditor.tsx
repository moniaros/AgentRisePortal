import React from 'react';
import { MicrositeBlock, HeroBlock, AboutBlock, ServicesBlock, AwardItem, AwardsBlock, TestimonialItem, TestimonialsBlock, NewsItem, NewsBlock, ContactBlock } from '../../types';

interface BlockEditorProps {
    block: MicrositeBlock;
    onUpdate: (updatedBlock: MicrositeBlock) => void;
}

const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const BlockEditor: React.FC<BlockEditorProps> = ({ block, onUpdate }) => {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate({ ...block, [e.target.name]: e.target.value } as MicrositeBlock);
    };
    
    // Generic handler for nested items (services, awards, etc.)
    const handleItemChange = (itemId: string, field: string, value: string, listName: string) => {
        const list = (block as any)[listName] as any[];
        const updatedList = list.map(item => item.id === itemId ? { ...item, [field]: value } : item);
        onUpdate({ ...block, [listName]: updatedList } as MicrositeBlock);
    };

    const addItem = (listName: string, newItem: any) => {
        const list = (block as any)[listName] || [];
        onUpdate({ ...block, [listName]: [...list, { ...newItem, id: generateId() }] } as MicrositeBlock);
    };

    const removeItem = (itemId: string, listName: string) => {
        const list = (block as any)[listName] as any[];
        onUpdate({ ...block, [listName]: list.filter(item => item.id !== itemId) } as MicrositeBlock);
    };

    const renderEditor = () => {
        switch (block.type) {
            case 'hero':
                const heroBlock = block as HeroBlock;
                return (
                    <div className="space-y-4">
                        <input name="title" value={heroBlock.title} onChange={handleInputChange} placeholder="Title" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <textarea name="subtitle" value={heroBlock.subtitle} onChange={handleInputChange} placeholder="Subtitle" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <input name="ctaText" value={heroBlock.ctaText} onChange={handleInputChange} placeholder="Button Text" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                );
            case 'about':
                const aboutBlock = block as AboutBlock;
                return (
                     <div className="space-y-4">
                        <input name="title" value={aboutBlock.title} onChange={handleInputChange} placeholder="Title" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <textarea name="content" value={aboutBlock.content} onChange={handleInputChange} placeholder="Content" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={5} />
                        <input name="imageUrl" value={aboutBlock.imageUrl} onChange={handleInputChange} placeholder="Image URL" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                );
            case 'services':
                 const servicesBlock = block as ServicesBlock;
                 return (
                     <div className="space-y-4">
                         <input name="title" value={servicesBlock.title} onChange={handleInputChange} placeholder="Title" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                         {servicesBlock.services.map((service) => (
                             <div key={service.id} className="p-2 border rounded dark:border-gray-600 space-y-2">
                                 <input value={service.name} onChange={e => handleItemChange(service.id, 'name', e.target.value, 'services')} placeholder="Service Name" className="w-full p-1 border rounded dark:bg-gray-600" />
                                 <textarea value={service.description} onChange={e => handleItemChange(service.id, 'description', e.target.value, 'services')} placeholder="Description" className="w-full p-1 border rounded dark:bg-gray-600" rows={2} />
                                 <button onClick={() => removeItem(service.id, 'services')} className="text-red-500 text-xs">Remove</button>
                             </div>
                         ))}
                         <button onClick={() => addItem('services', { name: '', description: '' })} className="text-blue-500 text-sm">+ Add Service</button>
                     </div>
                 );
             case 'awards':
                const awardsBlock = block as AwardsBlock;
                return (
                    <div className="space-y-4">
                        <input name="title" value={awardsBlock.title} onChange={handleInputChange} placeholder="Title" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        {awardsBlock.awards.map((award) => (
                            <div key={award.id} className="p-2 border rounded dark:border-gray-600 space-y-2">
                                <input value={award.title} onChange={e => handleItemChange(award.id, 'title', e.target.value, 'awards')} placeholder="Award Title" className="w-full p-1 border rounded dark:bg-gray-600" />
                                <input value={award.issuer} onChange={e => handleItemChange(award.id, 'issuer', e.target.value, 'awards')} placeholder="Issuer" className="w-full p-1 border rounded dark:bg-gray-600" />
                                <input value={award.year} onChange={e => handleItemChange(award.id, 'year', e.target.value, 'awards')} placeholder="Year" className="w-full p-1 border rounded dark:bg-gray-600" />
                                <button onClick={() => removeItem(award.id, 'awards')} className="text-red-500 text-xs">Remove</button>
                            </div>
                        ))}
                        <button onClick={() => addItem('awards', { title: '', issuer: '', year: '' })} className="text-blue-500 text-sm">+ Add Award</button>
                    </div>
                );
            case 'testimonials':
                const testimonialsBlock = block as TestimonialsBlock;
                 return (
                     <div className="space-y-4">
                         <input name="title" value={testimonialsBlock.title} onChange={handleInputChange} placeholder="Title" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                         {testimonialsBlock.testimonials.map((item) => (
                             <div key={item.id} className="p-2 border rounded dark:border-gray-600 space-y-2">
                                 <textarea value={item.quote} onChange={e => handleItemChange(item.id, 'quote', e.target.value, 'testimonials')} placeholder="Quote" className="w-full p-1 border rounded dark:bg-gray-600" rows={3} />
                                 <input value={item.author} onChange={e => handleItemChange(item.id, 'author', e.target.value, 'testimonials')} placeholder="Author" className="w-full p-1 border rounded dark:bg-gray-600" />
                                 <button onClick={() => removeItem(item.id, 'testimonials')} className="text-red-500 text-xs">Remove</button>
                             </div>
                         ))}
                         <button onClick={() => addItem('testimonials', { quote: '', author: '' })} className="text-blue-500 text-sm">+ Add Testimonial</button>
                     </div>
                 );
            case 'news':
                const newsBlock = block as NewsBlock;
                return (
                     <div className="space-y-4">
                         <input name="title" value={newsBlock.title} onChange={handleInputChange} placeholder="Title" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                         {newsBlock.items.map((item) => (
                             <div key={item.id} className="p-2 border rounded dark:border-gray-600 space-y-2">
                                 <input value={item.title} onChange={e => handleItemChange(item.id, 'title', e.target.value, 'items')} placeholder="News Title" className="w-full p-1 border rounded dark:bg-gray-600" />
                                 <input type="date" value={item.date} onChange={e => handleItemChange(item.id, 'date', e.target.value, 'items')} className="w-full p-1 border rounded dark:bg-gray-600" />
                                 <textarea value={item.summary} onChange={e => handleItemChange(item.id, 'summary', e.target.value, 'items')} placeholder="Summary" className="w-full p-1 border rounded dark:bg-gray-600" rows={3} />
                                 <button onClick={() => removeItem(item.id, 'items')} className="text-red-500 text-xs">Remove</button>
                             </div>
                         ))}
                         <button onClick={() => addItem('items', { title: '', date: new Date().toISOString().split('T')[0], summary: '' })} className="text-blue-500 text-sm">+ Add News</button>
                     </div>
                 );
            case 'contact':
                const contactBlock = block as ContactBlock;
                 return (
                     <div className="space-y-4">
                         <input name="title" value={contactBlock.title} onChange={handleInputChange} placeholder="Title" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                         <textarea name="subtitle" value={contactBlock.subtitle} onChange={handleInputChange} placeholder="Subtitle" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                     </div>
                 );
            default:
                return <div>Select a block to edit its content.</div>;
        }
    };
    
    return <div>{renderEditor()}</div>;
};

export default BlockEditor;
