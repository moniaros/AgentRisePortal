
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { BlockType, MicrositeBlock } from '../../types';
import GenerateSiteModal from './GenerateSiteModal';

interface BuilderControlsProps {
    onOpenSettings: () => void;
    onSetBlocks: (blocks: MicrositeBlock[]) => void;
    onOpenTemplatePanel: () => void;
    onAddBlock: (type: BlockType) => void;
}

const blockTypes: { type: BlockType, label: string }[] = [
    { type: 'hero', label: 'Hero Section' },
    { type: 'about', label: 'About Us' },
    { type: 'services', label: 'Services/Products' },
    { type: 'team', label: 'Team Members' },
    { type: 'testimonials', label: 'Testimonials' },
    { type: 'faq', label: 'FAQ' },
    { type: 'contact', label: 'Contact Form' },
    { type: 'news', label: 'News Feed' },
    { type: 'awards', label: 'Awards' },
    { type: 'certificates', label: 'Certificates' },
    { type: 'policy_highlights', label: 'Policy Highlights' },
    { type: 'location', label: 'Location Map' },
    { type: 'video', label: 'Video Embed' },
    { type: 'downloads', label: 'Downloads' },
];

const BuilderControls: React.FC<BuilderControlsProps> = ({ onOpenSettings, onSetBlocks, onOpenTemplatePanel, onAddBlock }) => {
    const { t } = useLocalization();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    return (
        <div className="flex flex-col h-full">
            {/* AI Generator Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg shadow-md text-white text-center mb-4 flex-shrink-0">
                <h3 className="font-bold text-sm mb-1">Start with AI</h3>
                <p className="text-xs text-blue-100 mb-3">Generate a complete site in seconds.</p>
                <button 
                    onClick={() => setIsAIModalOpen(true)}
                    className="w-full py-2 px-3 bg-white text-blue-600 text-xs font-bold rounded hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                    <span>🪄</span> Generate Site
                </button>
            </div>

            <div className="flex-shrink-0 mb-4">
                <button 
                    onClick={onOpenSettings}
                    className="w-full p-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded border dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                >
                    <span>⚙️</span> {t('micrositeBuilder.siteSettings')}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-700 mb-4 flex-shrink-0">
                <button 
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition border-blue-600 text-blue-600 dark:text-blue-400`}
                >
                    Blocks
                </button>
                <button 
                    onClick={onOpenTemplatePanel}
                    className={`flex-1 py-2 text-sm font-medium border-b-2 transition border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300`}
                >
                    Templates
                </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-2">
                    {blockTypes.map(block => (
                        <button 
                            key={block.type}
                            onClick={() => onAddBlock(block.type)}
                            className="p-3 text-xs text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:border-blue-400 hover:shadow-sm transition flex flex-col items-center justify-center gap-1 h-20"
                        >
                            <span className="text-gray-400 text-lg">+</span>
                            {block.label}
                        </button>
                    ))}
                </div>
            </div>

            <GenerateSiteModal 
                isOpen={isAIModalOpen} 
                onClose={() => setIsAIModalOpen(false)} 
                onGenerate={onSetBlocks} 
            />
        </div>
    );
};

export default BuilderControls;
