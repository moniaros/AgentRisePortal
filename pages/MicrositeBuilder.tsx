

import React, { useState, useEffect, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { MicrositeConfig, MicrositeBlock, BlockType, Language, BilingualText, ProductInfoBlock, CtaBlock, FormBlock } from '../types';

const STORAGE_KEY = 'micrositeConfig';

// Helper to get initial config from localStorage
const getInitialConfig = (): MicrositeConfig => {
    try {
        const storedConfig = localStorage.getItem(STORAGE_KEY);
        if (storedConfig) {
            const parsed = JSON.parse(storedConfig);
            // Basic validation
            if (Array.isArray(parsed.blocks)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Failed to parse microsite config from localStorage", error);
        localStorage.removeItem(STORAGE_KEY);
    }
    return { blocks: [] };
};

const createBilingualText = (en: string = '', el: string = ''): BilingualText => ({ en, el });

const MicrositeBuilder: React.FC = () => {
    const { t } = useLocalization();
    const [config, setConfig] = useState<MicrositeConfig>(getInitialConfig);
    const [previewLang, setPreviewLang] = useState<Language>(Language.EL);
    const [saveStatus, setSaveStatus] = useState<string>('');

    // Save config to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
            console.error("Failed to save microsite config to localStorage", error);
        }
    }, [config]);

    // FIX: Refactored the `addBlock` function to correctly infer the discriminated union type `MicrositeBlock`.
    // The previous IIFE implementation was causing issues with TypeScript's type inference.
    // Using a `let` variable and assigning within the `switch` statement allows for correct type narrowing.
    const addBlock = useCallback((type: BlockType) => {
        const id = `block-${Date.now()}`;
        let newBlock: MicrositeBlock;

        switch (type) {
            case 'productInfo':
                newBlock = {
                    id,
                    type,
                    title: createBilingualText('Product Title', 'Τίτλος Προϊόντος'),
                    content: createBilingualText('Product description...', 'Περιγραφή προϊόντος...'),
                };
                break;
            case 'cta':
                newBlock = {
                    id,
                    type,
                    text: createBilingualText('Contact Us', 'Επικοινωνήστε Μαζί Μας'),
                };
                break;
            case 'form':
                newBlock = {
                    id,
                    type,
                    title: createBilingualText('Interested? Let us know!', 'Ενδιαφέρεστε; Ενημερώστε μας!'),
                };
                break;
            default:
                throw new Error(`Unhandled block type: ${type}`);
        }

        setConfig(prevConfig => ({
            ...prevConfig,
            blocks: [...prevConfig.blocks, newBlock]
        }));
    }, []);

    const updateBlock = useCallback((id: string, newContent: Partial<MicrositeBlock>) => {
        setConfig(prevConfig => ({
            ...prevConfig,
            // FIX: The result of spreading a discriminated union member (`block`) and a partial of the whole union (`newContent`)
            // is not guaranteed to be a valid member of the union. A type assertion is added to tell TypeScript that
            // the calling logic ensures the merge is valid.
            blocks: prevConfig.blocks.map(block =>
                block.id === id ? ({ ...block, ...newContent } as MicrositeBlock) : block
            ),
        }));
    }, []);

    const removeBlock = useCallback((id: string) => {
        if (window.confirm('Are you sure you want to delete this block?')) {
            setConfig(prevConfig => ({
                ...prevConfig,
                blocks: prevConfig.blocks.filter(block => block.id !== id),
            }));
        }
    }, []);
    
    const moveBlock = useCallback((index: number, direction: 'up' | 'down') => {
        const newBlocks = [...config.blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
        
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]; // Swap
        setConfig({ ...config, blocks: newBlocks });

    }, [config]);
    
    const handleSaveDraft = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
            setSaveStatus(t('micrositeBuilder.draftSaved'));
            setTimeout(() => setSaveStatus(''), 3000); // Clear message after 3 seconds
        } catch (error) {
            console.error("Failed to save microsite config to localStorage", error);
            setSaveStatus('Error saving draft!');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    }, [config, t]);

    const renderBlockEditor = (block: MicrositeBlock, index: number) => {
        const blockTitle = t(`micrositeBuilder.block${block.type.charAt(0).toUpperCase() + block.type.slice(1)}`);
        
        const handleBilingualChange = (
          field: 'title' | 'content' | 'text', 
          lang: Language, 
          value: string
        ) => {
          const currentBlock = config.blocks.find(b => b.id === block.id);
          if (currentBlock && field in currentBlock) {
             const typedBlock = currentBlock as ProductInfoBlock | CtaBlock | FormBlock;
             const updatedField = { ...typedBlock[field], [lang]: value };
             updateBlock(block.id, { [field]: updatedField } as any);
          }
        };

        return (
            <div key={block.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-lg">{blockTitle}</h4>
                    <div className="flex items-center gap-2">
                        <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 dark:hover:text-white">↑</button>
                        <button onClick={() => moveBlock(index, 'down')} disabled={index === config.blocks.length - 1} className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 dark:hover:text-white">↓</button>
                        <button onClick={() => removeBlock(block.id)} className="p-1 text-red-500 hover:text-red-700">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
                
                {'title' in block && (
                     <BilingualInput label={t('micrositeBuilder.titleLabel')} value={block.title} onChange={(lang, val) => handleBilingualChange('title', lang, val)} />
                )}
                {'content' in block && (
                     <BilingualTextarea label={t('micrositeBuilder.contentLabel')} value={block.content} onChange={(lang, val) => handleBilingualChange('content', lang, val)} />
                )}
                {'text' in block && (
                     <BilingualInput label={t('micrositeBuilder.buttonTextLabel')} value={block.text} onChange={(lang, val) => handleBilingualChange('text', lang, val)} />
                )}
            </div>
        );
    };

    const renderPreviewBlock = (block: MicrositeBlock) => {
        switch (block.type) {
            case 'productInfo':
                const productInfo = block as ProductInfoBlock;
                return (
                    <div key={block.id} className="mb-8 p-6 bg-white rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">{productInfo.title[previewLang]}</h2>
                        <p className="text-gray-600 leading-relaxed">{productInfo.content[previewLang]}</p>
                    </div>
                );
            case 'cta':
                 const cta = block as CtaBlock;
                return (
                    <div key={block.id} className="text-center my-10">
                        <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition duration-300 shadow-lg text-lg">
                           {cta.text[previewLang]}
                        </button>
                    </div>
                );
            case 'form':
                const form = block as FormBlock;
                return (
                    <div key={block.id} className="my-8 p-6 bg-gray-50 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-semibold text-center text-gray-800 mb-4">{form.title[previewLang]}</h3>
                         <form className="space-y-4">
                            <input type="text" placeholder={t('micrositeBuilder.formNamePlaceholder')} className="w-full p-3 border border-gray-300 rounded-md" />
                            <input type="email" placeholder={t('micrositeBuilder.formEmailPlaceholder')} className="w-full p-3 border border-gray-300 rounded-md" />
                            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition duration-300">
                               {t('micrositeBuilder.formSubmit')}
                            </button>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };
    

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('micrositeBuilder.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('micrositeBuilder.description')}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Panel */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-2xl font-bold">{t('micrositeBuilder.editorTitle')}</h2>
                         <div className="flex items-center gap-2">
                            {saveStatus && <span className="text-sm text-green-600 dark:text-green-400 transition-opacity duration-300">{saveStatus}</span>}
                            <button onClick={handleSaveDraft} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
                                {t('micrositeBuilder.saveDraft')}
                            </button>
                        </div>
                    </div>

                    <div className="mb-4 space-x-2">
                        <button onClick={() => addBlock('productInfo')} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">{t('micrositeBuilder.blockProductInfo')}</button>
                        <button onClick={() => addBlock('cta')} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">{t('micrositeBuilder.blockCta')}</button>
                        <button onClick={() => addBlock('form')} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm">{t('micrositeBuilder.blockForm')}</button>
                    </div>
                    
                    {config.blocks.length > 0 ? (
                        config.blocks.map((block, index) => renderBlockEditor(block, index))
                    ) : (
                        <p className="text-center text-gray-500 py-8">{t('micrositeBuilder.emptyBuilder')}</p>
                    )}
                </div>

                {/* Preview Panel */}
                <div className="bg-gray-200 dark:bg-gray-900 p-6 rounded-lg shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">{t('micrositeBuilder.previewTitle')}</h2>
                        <div>
                             <span className="text-sm mr-2">{t('micrositeBuilder.previewSwitch')}</span>
                             <select value={previewLang} onChange={(e) => setPreviewLang(e.target.value as Language)} className="p-1 text-sm rounded border-gray-400 dark:bg-gray-700">
                                <option value={Language.EN}>{t('micrositeBuilder.english')}</option>
                                <option value={Language.EL}>{t('micrositeBuilder.greek')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md min-h-[600px] overflow-y-auto">
                       {config.blocks.length > 0 ? (
                           config.blocks.map(block => renderPreviewBlock(block))
                       ) : (
                           <p className="text-center text-gray-500 pt-20">{t('micrositeBuilder.emptyPreview')}</p>
                       )}
                    </div>
                </div>
            </div>
        </div>
    );
};


// Helper components for bilingual inputs
interface BilingualInputProps {
    label: string;
    value: BilingualText;
    onChange: (lang: Language, value: string) => void;
}

const BilingualInput: React.FC<BilingualInputProps> = ({ label, value, onChange }) => {
    const { t } = useLocalization();
    return (
        <div className="space-y-2 mt-2">
            <label className="block text-sm font-medium">{label}</label>
            <div className="flex gap-2">
                <input type="text" placeholder={t('micrositeBuilder.english')} value={value.en} onChange={(e) => onChange(Language.EN, e.target.value)} className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-600"/>
                <input type="text" placeholder={t('micrositeBuilder.greek')} value={value.el} onChange={(e) => onChange(Language.EL, e.target.value)} className="w-full p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-600"/>
            </div>
        </div>
    )
}

const BilingualTextarea: React.FC<BilingualInputProps> = ({ label, value, onChange }) => {
    const { t } = useLocalization();
    return (
        <div className="space-y-2 mt-2">
            <label className="block text-sm font-medium">{label}</label>
            <div className="flex gap-2">
                <textarea placeholder={t('micrositeBuilder.english')} value={value.en} onChange={(e) => onChange(Language.EN, e.target.value)} className="w-full p-2 text-sm border rounded h-24 dark:bg-gray-800 dark:border-gray-600"></textarea>
                <textarea placeholder={t('micrositeBuilder.greek')} value={value.el} onChange={(e) => onChange(Language.EL, e.target.value)} className="w-full p-2 text-sm border rounded h-24 dark:bg-gray-800 dark:border-gray-600"></textarea>
            </div>
        </div>
    )
}


export default MicrositeBuilder;