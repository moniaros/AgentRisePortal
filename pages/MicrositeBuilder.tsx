import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { MicrositeBlock, MicrositeConfig } from '../types';
import BuilderControls from '../components/microsite/BuilderControls';
import BlockEditor from '../components/microsite/BlockEditor';
import SitePreview from '../components/microsite/SitePreview';

const initialBlocks: MicrositeBlock[] = [
    { id: 'hero-1', type: 'hero', title: 'Your Insurance Partner', subtitle: 'Protecting what matters most.', ctaText: 'Get a Quote', imageUrl: '' },
    { id: 'services-1', type: 'services', title: 'Our Services', services: [
        { id: 's1', name: 'Auto Insurance', description: 'Comprehensive coverage for your vehicle.', icon: '' },
        { id: 's2', name: 'Home Insurance', description: 'Protect your home and belongings.', icon: '' },
    ]},
];

const initialConfig: MicrositeConfig = {
    siteTitle: 'My Agency',
    themeColor: '#3b82f6', // blue-600
    contactEmail: 'info@myagency.com',
    contactPhone: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    social: {
        facebook: '#',
        linkedin: '#',
        x: '#',
    },
};

const MicrositeBuilder: React.FC = () => {
    const { t } = useLocalization();
    const [blocks, setBlocks] = useState<MicrositeBlock[]>(initialBlocks);
    const [config, setConfig] = useState<MicrositeConfig>(initialConfig);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isSettingsEditorOpen, setIsSettingsEditorOpen] = useState(false);

    const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null;

    const updateBlock = (updatedBlock: MicrositeBlock) => {
        setBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
    };
    
    const addBlock = (type: MicrositeBlock['type']) => {
        const newBlock: MicrositeBlock = {
            id: `${type}-${Date.now()}`,
            type: type,
            ...getInitialBlockData(type)
        } as MicrositeBlock;
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const handleSelectBlock = (id: string) => {
        setSelectedBlockId(id);
        setIsSettingsEditorOpen(false);
    };
    
    const handleOpenSettings = () => {
        setSelectedBlockId(null);
        setIsSettingsEditorOpen(true);
    };

    return (
        <div className="flex h-[calc(100vh-100px)]">
            {/* Left Panel: Controls & Editor */}
            <aside className="w-80 bg-white dark:bg-gray-800 p-4 border-r dark:border-gray-700 overflow-y-auto flex-shrink-0">
                <BuilderControls onAddBlock={addBlock} onOpenSettings={handleOpenSettings} />
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <BlockEditor 
                        block={selectedBlock} 
                        config={config}
                        isSettingsOpen={isSettingsEditorOpen}
                        onUpdateBlock={updateBlock}
                        onUpdateConfig={setConfig}
                    />
                </div>
            </aside>
            
            {/* Right Panel: Preview */}
            <main className="flex-1 bg-gray-200 dark:bg-gray-900 overflow-y-auto">
                <SitePreview blocks={blocks} config={config} onSelectBlock={handleSelectBlock} selectedBlockId={selectedBlockId} />
            </main>
        </div>
    );
};

const getInitialBlockData = (type: MicrositeBlock['type']) => {
    switch(type) {
        case 'about': return { title: 'About Us', content: '', imageUrl: '' };
        case 'services': return { title: 'Our Services', services: [] };
        case 'team': return { title: 'Our Team', members: [] };
        case 'testimonials': return { title: 'Testimonials', testimonials: [] };
        case 'faq': return { title: 'FAQ', items: [] };
        case 'contact': return { title: 'Contact Us', subtitle: '' };
        case 'news': return { title: 'Latest News', items: [] };
        case 'awards': return { title: 'Awards', awards: [] };
        case 'certificates': return { title: 'Certificates', certificates: [] };
        case 'policy_highlights': return { title: 'Policy Highlights', highlights: [] };
        case 'location': return { title: 'Our Location', address: '', googleMapsUrl: '' };
        case 'video': return { title: 'Watch Our Video', youtubeVideoId: '' };
        case 'downloads': return { title: 'Downloads', files: [] };
        case 'hero':
        default:
            return { title: 'New Section', subtitle: '', ctaText: '', imageUrl: '' };
    }
}


export default MicrositeBuilder;
