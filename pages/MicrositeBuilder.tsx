import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { MicrositeBlock, MicrositeSettings } from '../types';
import BuilderControls from '../components/microsite/BuilderControls';
import SitePreview from '../components/microsite/SitePreview';
import SiteSettingsEditor from '../components/microsite/SiteSettingsEditor';
import BlockEditor from '../components/microsite/BlockEditor';

const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialBlocks: MicrositeBlock[] = [
    { id: generateId(), type: 'hero', title: 'Your Trusted Insurance Partner', subtitle: 'Protecting your tomorrow, today.', ctaText: 'Get a Free Quote' },
    { id: generateId(), type: 'products', title: 'Our Insurance Products', products: [{id: 'prod_1', name: 'Auto Insurance', description: 'Comprehensive coverage for your vehicle.'}] },
    { id: generateId(), type: 'contact', title: 'Get In Touch', subtitle: 'We would love to hear from you!' },
];

const initialSettings: MicrositeSettings = {
    themeColor: '#3B82F6', // blue-600
    font: 'Inter',
    companyName: 'AgentOS Insurance',
};


const MicrositeBuilder: React.FC = () => {
    const { t } = useLocalization();
    const [blocks, setBlocks] = useState<MicrositeBlock[]>(initialBlocks);
    const [settings, setSettings] = useState<MicrositeSettings>(initialSettings);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const handleUpdateBlock = (updatedBlock: MicrositeBlock) => {
        setBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
        if (selectedBlockId === null) setIsSettingsOpen(false); // Close settings when a block is selected
    };
    
    const handleSelectBlock = (id: string | null) => {
        setSelectedBlockId(id);
        if (id !== null) {
            setIsSettingsOpen(false);
        }
    }
    
    const handleOpenSettings = () => {
        setSelectedBlockId(null);
        setIsSettingsOpen(true);
    }

    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    return (
        <div className="flex h-[calc(100vh-120px)]"> {/* Adjust height to fit within layout */}
            {/* Left Panel: Controls & Editor */}
            <div className="w-1/3 bg-white dark:bg-gray-800 p-4 overflow-y-auto border-r dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4">{t('micrositeBuilder.title')}</h2>
                 <BuilderControls 
                    blocks={blocks}
                    setBlocks={setBlocks}
                    selectedBlockId={selectedBlockId}
                    setSelectedBlockId={handleSelectBlock}
                    onOpenSettings={handleOpenSettings}
                 />
                 {isSettingsOpen ? (
                     <SiteSettingsEditor settings={settings} onUpdate={setSettings} />
                 ) : selectedBlock ? (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold capitalize mb-2">{selectedBlock.type} Block</h3>
                        <BlockEditor block={selectedBlock} onUpdate={handleUpdateBlock} />
                    </div>
                 ) : null}
            </div>

            {/* Right Panel: Preview */}
            <div className="w-2/3 bg-gray-100 dark:bg-gray-900 p-4 overflow-y-auto">
                <SitePreview blocks={blocks} settings={settings} />
            </div>
        </div>
    );
};

export default MicrositeBuilder;
