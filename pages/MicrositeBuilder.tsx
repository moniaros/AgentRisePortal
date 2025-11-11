import React, { useState } from 'react';
import { MicrositeBlock, MicrositeConfig } from '../types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import BuilderControls from '../components/microsite/BuilderControls';
import BlockEditor from '../components/microsite/BlockEditor';
import SitePreview from '../components/microsite/SitePreview';

// Mock initial data
const initialBlocks: MicrositeBlock[] = [
    { id: 'block-1', type: 'hero', title: 'Your Insurance Partner', subtitle: 'Protecting what matters most.', ctaText: 'Get a Quote', imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932' },
    { id: 'block-2', type: 'about', title: 'About Our Agency', content: 'We are a dedicated team of professionals...', imageUrl: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80' },
    { id: 'block-3', type: 'services', title: 'Our Products', services: [{ id: 's1', name: 'Auto Insurance', description: 'Comprehensive coverage for your vehicle.', icon: '' }] },
];

const initialConfig: MicrositeConfig = {
    siteTitle: 'My Insurance Agency',
    themeColor: '#2563eb', // blue-600
    contactEmail: 'contact@agency.com',
    contactPhone: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    social: { facebook: '#', linkedin: '#', x: '#' },
};


const MicrositeBuilder: React.FC = () => {
    const [blocks, setBlocks] = useState<MicrositeBlock[]>(initialBlocks);
    const [config, setConfig] = useState<MicrositeConfig>(initialConfig);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;

    const handleSelectBlock = (id: string) => {
        setSelectedBlockId(id);
        setIsSettingsOpen(false);
    };

    const handleOpenSettings = () => {
        setIsSettingsOpen(true);
        setSelectedBlockId(null);
    };

    const handleUpdateBlock = (updatedBlock: MicrositeBlock) => {
        setBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex h-[calc(100vh-120px)]">
                {/* Left Panel: Controls */}
                <div className="w-1/4 bg-white dark:bg-gray-800 p-4 overflow-y-auto border-r dark:border-gray-700">
                    <BuilderControls onOpenSettings={handleOpenSettings} />
                </div>

                {/* Center Panel: Preview */}
                <div className="w-1/2 bg-gray-200 dark:bg-gray-900 overflow-y-auto">
                    <SitePreview 
                        blocks={blocks}
                        config={config}
                        onSelectBlock={handleSelectBlock}
                        selectedBlockId={selectedBlockId}
                    />
                </div>

                {/* Right Panel: Editor */}
                <div className="w-1/4 bg-white dark:bg-gray-800 p-4 overflow-y-auto border-l dark:border-gray-700">
                    <BlockEditor 
                        block={selectedBlock}
                        config={config}
                        isSettingsOpen={isSettingsOpen}
                        onUpdateBlock={handleUpdateBlock}
                        onUpdateConfig={setConfig}
                    />
                </div>
            </div>
        </DndProvider>
    );
};

export default MicrositeBuilder;
