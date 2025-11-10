import React from 'react';
import { MicrositeBlock, MicrositeConfig } from '../../types';
import SiteSettingsEditor from './SiteSettingsEditor';
// We'll need to create editor forms for each block type. Let's assume they exist.

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
        return <p className="text-sm text-gray-500">Select a block to edit or open Site Settings.</p>;
    }

    // A real implementation would have specific forms for each block type.
    // For this mock, we'll just show a generic editor.
    const handleGenericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateBlock({ ...block, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold capitalize">{block.type} Block</h3>
            {Object.entries(block).map(([key, value]) => {
                if (key === 'id' || key === 'type' || typeof value !== 'string') return null;
                return (
                    <div key={key}>
                        <label className="block text-sm font-medium capitalize">{key}</label>
                        <input
                            type="text"
                            name={key}
                            value={value}
                            onChange={handleGenericChange}
                            className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default BlockEditor;
