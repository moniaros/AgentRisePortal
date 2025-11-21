
import React from 'react';
import { MicrositeBlock, MicrositeConfig } from '../../types';
import SiteSettingsEditor from './SiteSettingsEditor';
import AIContentRefiner from './AIContentRefiner';

interface BlockEditorProps {
    block: MicrositeBlock | null;
    config: MicrositeConfig;
    isSettingsOpen: boolean;
    onUpdateBlock: (updatedBlock: MicrositeBlock) => void;
    onUpdateConfig: (updatedConfig: MicrositeConfig) => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ block, config, isSettingsOpen, onUpdateBlock, onUpdateConfig }) => {

    if (isSettingsOpen) {
        return <SiteSettingsEditor config={config} onUpdate={onUpdateConfig} />;
    }

    if (!block) {
        return <p className="text-sm text-gray-500 p-4 text-center">Select a block to edit or open Site Settings.</p>;
    }

    const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdateBlock({ ...block, [e.target.name]: e.target.value });
    };

    const handleAIUpdate = (key: string, value: string) => {
        onUpdateBlock({ ...block, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                <h3 className="text-lg font-semibold capitalize">{block.type} Block</h3>
                <span className="text-xs text-gray-500 font-mono">{block.id}</span>
            </div>
            
            {Object.entries(block).map(([key, value]) => {
                if (key === 'id' || key === 'type' || typeof value !== 'string') return null;
                
                const isLongText = key === 'content' || key === 'subtitle' || key === 'description';

                return (
                    <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium capitalize text-gray-700 dark:text-gray-300">{key}</label>
                            <AIContentRefiner 
                                initialValue={value} 
                                fieldName={key} 
                                context={block.type} 
                                onAccept={(val) => handleAIUpdate(key, val)} 
                            />
                        </div>
                        {isLongText ? (
                            <textarea
                                name={key}
                                value={value}
                                onChange={handleGenericChange}
                                rows={4}
                                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                            />
                        ) : (
                            <input
                                type="text"
                                name={key}
                                value={value}
                                onChange={handleGenericChange}
                                className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BlockEditor;
