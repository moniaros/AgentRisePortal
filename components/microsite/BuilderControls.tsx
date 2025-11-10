import React, { useState } from 'react';
import { MicrositeBlock, MicrositeConfig, MicrositeBlockType } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import BlockEditor from './BlockEditor';
import SiteSettingsEditor from './SiteSettingsEditor';

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

    const addBlock = (type: MicrositeBlockType) => {
        let newBlock: MicrositeBlock;
        // FIX: Remove 'type' from common object to avoid type conflicts inside the switch statement.
        const common = { id: generateId(), title: `New ${type} block` };
        switch (type) {
            case 'hero':
                // FIX: Explicitly set the 'type' to the correct literal string to match the 'HeroBlock' type.
                newBlock = { ...common, type: 'hero', subtitle: '', ctaText: '' };
                break;
            case 'products':
                // FIX: Explicitly set the 'type' to the correct literal string to match the 'ProductsBlock' type.
                newBlock = { ...common, type: 'products', products: [] };
                break;
            case 'testimonials':
                // FIX: Explicitly set the 'type' to the correct literal string to match the 'TestimonialsBlock' type.
                newBlock = { ...common, type: 'testimonials', testimonials: [] };
                break;
            case 'faq':
                // FIX: Explicitly set the 'type' to the correct literal string to match the 'FaqBlock' type.
                newBlock = { ...common, type: 'faq', items: [] };
                break;
            case 'contact':
                // FIX: Explicitly set the 'type' to the correct literal string to match the 'ContactBlock' type.
                newBlock = { ...common, type: 'contact', subtitle: '' };
                break;
            default:
                // This path should not be reachable with the current types, but it's good practice for exhaustiveness.
                return;
        }
        setBlocks([...blocks, newBlock]);
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
                                    <button onClick={() => setSelectedId(block.id)} className="flex-grow text-left capitalize">{block.type}</button>
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
                    <select onChange={(e) => addBlock(e.target.value as MicrositeBlockType)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        <option>{t('micrositeBuilder.addBlock')}</option>
                        <option value="hero">Hero</option>
                        <option value="products">Products</option>
                        <option value="testimonials">Testimonials</option>
                        <option value="faq">FAQ</option>
                        <option value="contact">Contact Form</option>
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