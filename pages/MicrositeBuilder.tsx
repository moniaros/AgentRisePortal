
import React, { useState } from 'react';
import { MicrositeBlock, MicrositeConfig } from '../types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNotification } from '../hooks/useNotification';

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
    
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
    const { addNotification } = useNotification();

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

    const handlePublish = () => {
        setIsPublishing(true);
        // Simulate API deployment
        setTimeout(() => {
            setIsPublishing(false);
            const mockUrl = `https://agentos.site/${config.siteTitle.toLowerCase().replace(/\s+/g, '-')}`;
            setPublishedUrl(mockUrl);
            addNotification('Website published successfully!', 'success');
        }, 2000);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-[calc(100vh-80px)]">
                {/* Header Toolbar */}
                <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Microsite Builder</h1>
                        {publishedUrl && <a href={publishedUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline">Live: {publishedUrl}</a>}
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 text-sm border rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                            Preview
                        </button>
                        <button 
                            onClick={handlePublish} 
                            disabled={isPublishing}
                            className="px-4 py-2 text-sm bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isPublishing ? 'Publishing...' : 'Publish Site'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-grow overflow-hidden">
                    {/* Left Panel: Controls */}
                    <div className="w-64 bg-white dark:bg-gray-800 p-4 overflow-y-auto border-r dark:border-gray-700 flex-shrink-0">
                        <BuilderControls 
                            onOpenSettings={handleOpenSettings} 
                            onSetBlocks={setBlocks}
                        />
                    </div>

                    {/* Center Panel: Preview */}
                    <div className="flex-grow bg-gray-200 dark:bg-gray-900 overflow-y-auto relative">
                        <div className="min-h-full p-8 flex justify-center">
                            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-md overflow-hidden min-h-[800px]">
                                <SitePreview 
                                    blocks={blocks}
                                    config={config}
                                    onSelectBlock={handleSelectBlock}
                                    selectedBlockId={selectedBlockId}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Editor */}
                    <div className="w-80 bg-white dark:bg-gray-800 p-4 overflow-y-auto border-l dark:border-gray-700 flex-shrink-0">
                        <BlockEditor 
                            block={selectedBlock}
                            config={config}
                            isSettingsOpen={isSettingsOpen}
                            onUpdateBlock={handleUpdateBlock}
                            onUpdateConfig={setConfig}
                        />
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default MicrositeBuilder;
