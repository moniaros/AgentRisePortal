
import React, { useState } from 'react';
import { MicrositeBlock, MicrositeConfig, MicrositeTemplate, BlockType } from '../types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNotification } from '../hooks/useNotification';

import BuilderControls from '../components/microsite/BuilderControls';
import BlockEditor from '../components/microsite/BlockEditor';
import SitePreview from '../components/microsite/SitePreview';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import TemplateSelector from '../components/microsite/TemplateSelector';
import { useAuth } from '../hooks/useAuth';


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

interface TemplatePanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyTemplate: (template: MicrositeTemplate) => void;
}

const TemplatePanel: React.FC<TemplatePanelProps> = ({ isOpen, onClose, onApplyTemplate }) => {
    const { currentUser } = useAuth();
    const userTier = currentUser?.plan?.tier || 'free';

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/30 z-20 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Panel */}
            <div 
                className={`absolute top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-2xl z-30 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-full max-w-md md:max-w-lg border-r dark:border-gray-700 flex flex-col`}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-lg font-bold">Choose a Template</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-4 overflow-y-auto flex-grow custom-scrollbar">
                    <TemplateSelector onSelect={onApplyTemplate} userTier={userTier} />
                </div>
            </div>
        </>
    );
};


const MicrositeBuilder: React.FC = () => {
    const [blocks, setBlocks] = useState<MicrositeBlock[]>(initialBlocks);
    const [config, setConfig] = useState<MicrositeConfig>(initialConfig);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
    const { addNotification } = useNotification();

    // Template Confirmation State
    const [pendingTemplate, setPendingTemplate] = useState<MicrositeTemplate | null>(null);
    const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);


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

    const handleAddBlock = (type: BlockType) => {
        const newBlock: MicrositeBlock = {
            id: `block_${Date.now()}`,
            type: type as any,
            // Default properties for each block type could be more robust here
            title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
            // @ts-ignore - simpler for now, a real factory would handle specific props per type
            content: 'Edit this text...',
            subtitle: 'Add a subtitle',
            services: [],
            testimonials: [],
            items: [],
            members: [],
            awards: [],
            certificates: [],
            highlights: []
        } as any;
        
        setBlocks([...blocks, newBlock]);
        // Auto-scroll to bottom would be nice here
        setTimeout(() => setSelectedBlockId(newBlock.id), 100);
    };

    const handleApplyTemplateRequest = (template: MicrositeTemplate) => {
        setPendingTemplate(template);
        setIsTemplatePanelOpen(false);
    };

    const confirmApplyTemplate = () => {
        if (pendingTemplate) {
            // Regenerate IDs to ensure they are unique
            const newBlocks = pendingTemplate.blocks.map(b => ({
                ...b,
                id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }));
            setBlocks(newBlocks);
            
            if (pendingTemplate.defaultConfig) {
                setConfig(prev => ({ ...prev, ...pendingTemplate.defaultConfig }));
            }
            
            addNotification(`Applied template: ${pendingTemplate.name}`, 'success');
            setPendingTemplate(null);
            setSelectedBlockId(null);
        }
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

                <div className="flex flex-grow overflow-hidden relative">
                     <TemplatePanel
                        isOpen={isTemplatePanelOpen}
                        onClose={() => setIsTemplatePanelOpen(false)}
                        onApplyTemplate={handleApplyTemplateRequest}
                    />
                    
                    {/* Left Panel: Controls */}
                    <div className="w-72 bg-white dark:bg-gray-800 p-4 overflow-y-auto border-r dark:border-gray-700 flex-shrink-0">
                        <BuilderControls 
                            onOpenSettings={handleOpenSettings} 
                            onSetBlocks={setBlocks}
                            onOpenTemplatePanel={() => setIsTemplatePanelOpen(true)}
                            onAddBlock={handleAddBlock}
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

                <ConfirmationModal
                    isOpen={!!pendingTemplate}
                    onClose={() => setPendingTemplate(null)}
                    onConfirm={confirmApplyTemplate}
                    title="Apply Template?"
                    confirmText="Apply & Overwrite"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                >
                    <p>Warning: Applying a new template will <strong>overwrite</strong> your current block layout. This action cannot be undone.</p>
                </ConfirmationModal>
            </div>
        </DndProvider>
    );
};

export default MicrositeBuilder;
