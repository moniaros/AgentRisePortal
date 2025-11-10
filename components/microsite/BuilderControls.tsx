import React, { useState } from 'react';
import { MicrositeBlock, MicrositeConfig, MicrositeBlockType, AboutBlock, ServicesBlock, AwardsBlock, NewsBlock } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import BlockEditor from './BlockEditor';
import SiteSettingsEditor from './SiteSettingsEditor';
import { GoogleGenAI, Type } from '@google/genai';

interface BuilderControlsProps {
    blocks: MicrositeBlock[];
    setBlocks: React.Dispatch<React.SetStateAction<MicrositeBlock[]>>;
    config: MicrositeConfig;
    setConfig: React.Dispatch<React.SetStateAction<MicrositeConfig>>;
    onUpdateBlock: (updatedBlock: MicrositeBlock) => void;
}

const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const BuilderControls: React.FC<BuilderControlsProps> = ({ blocks, setBlocks, config, setConfig, onUpdateBlock }) => {
    const { t } = useLocalization();
    const [selectedId, setSelectedId] = useState<string | 'settings' | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const getAiGeneratedContent = async (type: MicrositeBlockType): Promise<Partial<MicrositeBlock>> => {
        if (!process.env.API_KEY) {
            console.error("API Key not found");
            return {};
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let prompt = '';
        let responseSchema: any;

        switch (type) {
            case 'about':
                prompt = "Generate content for an 'About Us' section of an insurance agency website. Provide a title, one paragraph of content, and a placeholder image URL.";
                responseSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING }, imageUrl: { type: Type.STRING } } };
                break;
            case 'services':
                prompt = "Generate a title and a list of 3 common insurance services for an agency website. For each service, provide a name and a short description.";
                responseSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, services: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } } } };
                break;
            case 'awards':
                prompt = "Generate a title and a list of 2 fictional but realistic-sounding awards for a top insurance agency. For each, provide the award title, the issuing organization, and the year.";
                responseSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, awards: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, issuer: { type: Type.STRING }, year: { type: Type.STRING } } } } } };
                break;
            case 'news':
                 prompt = "Generate a title and a list of 2 fictional news items for an insurance agency. For each, provide a title, a recent date (YYYY-MM-DD), and a short summary.";
                 responseSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, date: { type: Type.STRING }, summary: { type: Type.STRING } } } } } };
                break;
            // Add cases for other types if needed
            default:
                return {};
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });
            const content = JSON.parse(response.text);
            // Add unique IDs to nested items
            if (content.services) content.services = content.services.map((s: any) => ({...s, id: generateId()}));
            if (content.awards) content.awards = content.awards.map((a: any) => ({...a, id: generateId()}));
            if (content.items) content.items = content.items.map((i: any) => ({...i, id: generateId()}));
            return content;
        } catch (error) {
            console.error(`AI content generation failed for ${type}:`, error);
            return {};
        }
    };

    const addBlock = async (type: MicrositeBlockType) => {
        setIsAiLoading(true);
        const tempId = generateId();

        // Add a placeholder with loading state
        const placeholderBlock = { id: tempId, type, title: t('micrositeBuilder.generatingAiContent'), isLoading: true } as MicrositeBlock;
        setBlocks(prev => [...prev, placeholderBlock]);

        const aiContent = await getAiGeneratedContent(type);

        let newBlock: MicrositeBlock;
        
        // FIX: Replaced broad object spread with explicit property assignment to resolve TypeScript errors.
        // The spread of `aiContent` (typed as a partial of a union) was creating objects that didn't strictly match any single block type.
        switch (type) {
            case 'hero':
                newBlock = { id: tempId, type: 'hero', title: 'New Hero', subtitle: '', ctaText: 'Learn More', isLoading: false };
                break;
            case 'about':
                const aboutAiContent = aiContent as Partial<AboutBlock>;
                newBlock = { id: tempId, type: 'about', title: aboutAiContent.title || 'About Us', content: aboutAiContent.content || '', imageUrl: aboutAiContent.imageUrl || '', isLoading: false };
                break;
            case 'services':
                const servicesAiContent = aiContent as Partial<ServicesBlock>;
                newBlock = { id: tempId, type: 'services', title: servicesAiContent.title || 'Our Services', services: servicesAiContent.services || [], isLoading: false };
                break;
            case 'awards':
                const awardsAiContent = aiContent as Partial<AwardsBlock>;
                newBlock = { id: tempId, type: 'awards', title: awardsAiContent.title || 'Our Awards', awards: awardsAiContent.awards || [], isLoading: false };
                break;
            case 'testimonials':
                 newBlock = { id: tempId, type: 'testimonials', title: 'Testimonials', testimonials: [], isLoading: false };
                 break;
            case 'news':
                 const newsAiContent = aiContent as Partial<NewsBlock>;
                 newBlock = { id: tempId, type: 'news', title: newsAiContent.title || 'Latest News', items: newsAiContent.items || [], isLoading: false };
                 break;
            case 'contact':
                newBlock = { id: tempId, type: 'contact', title: 'Contact Us', subtitle: 'Get in touch!', isLoading: false };
                break;
            default:
                // This should not happen
                newBlock = { id: tempId, type: 'hero', title: 'Error', subtitle: '', ctaText: '', isLoading: false };
        }
        
        // Replace placeholder with the real block
        setBlocks(prev => prev.map(b => b.id === tempId ? newBlock : b));
        setIsAiLoading(false);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= blocks.length) return;
        const newBlocks = [...blocks];
        [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };
    
    const selectedBlock = blocks.find(b => b.id === selectedId);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold mb-2">{t('micrositeBuilder.structure')}</h3>
                <div className="p-2 border rounded-md dark:border-gray-600">
                    <details className="group" open>
                        <summary className="font-medium cursor-pointer" onClick={(e) => { e.preventDefault(); setSelectedId('settings'); }}>
                            {t('micrositeBuilder.siteSettings')}
                        </summary>
                         <div className="mt-2 space-y-2">
                             {blocks.map((block, index) => (
                                <div key={block.id} className={`flex items-center justify-between p-2 rounded-md ${selectedId === block.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    <button onClick={() => setSelectedId(block.id)} className="flex-grow text-left capitalize">
                                        {block.isLoading ? t('micrositeBuilder.generatingAiContent') : t(`micrositeBuilder.blocks.${block.type}`)}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => moveBlock(index, 'up')} disabled={index === 0}>↑</button>
                                        <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1}>↓</button>
                                        <button onClick={() => removeBlock(block.id)} className="text-red-500">×</button>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </details>
                </div>
                 <div className="mt-2">
                    <select
                        onChange={(e) => addBlock(e.target.value as MicrositeBlockType)}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        disabled={isAiLoading}
                        value=""
                    >
                        <option value="" disabled>{isAiLoading ? t('micrositeBuilder.generatingAiContent') : t('micrositeBuilder.addBlock')}</option>
                        <option value="hero">{t('micrositeBuilder.blocks.hero')}</option>
                        <option value="about">{t('micrositeBuilder.blocks.about')}</option>
                        <option value="services">{t('micrositeBuilder.blocks.services')}</option>
                        <option value="awards">{t('micrositeBuilder.blocks.awards')}</option>
                        <option value="testimonials">{t('micrositeBuilder.blocks.testimonials')}</option>
                        <option value="news">{t('micrositeBuilder.blocks.news')}</option>
                        <option value="contact">{t('micrositeBuilder.blocks.contact')}</option>
                    </select>
                </div>
            </div>
             <div>
                <h3 className="font-semibold mb-2">{t('common.edit')}</h3>
                <div className="p-4 border rounded-md dark:border-gray-600 min-h-[200px]">
                    {selectedId === 'settings' && <SiteSettingsEditor config={config} onUpdate={setConfig} />}
                    {selectedBlock && <BlockEditor block={selectedBlock} onUpdate={onUpdateBlock} />}
                    {!selectedId && <p className="text-sm text-gray-500">Select an item to edit.</p>}
                </div>
             </div>
        </div>
    );
};

export default BuilderControls;