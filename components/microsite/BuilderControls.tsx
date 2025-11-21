
import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { BlockType, MicrositeBlock } from '../../types';
import GenerateSiteModal from './GenerateSiteModal';

interface BuilderControlsProps {
    onOpenSettings: () => void;
    onSetBlocks: (blocks: MicrositeBlock[]) => void;
    // onAddBlock: (type: BlockType) => void;
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

const BuilderControls: React.FC<BuilderControlsProps> = ({ onOpenSettings, onSetBlocks }) => {
    const { t } = useLocalization();
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* AI Generator Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg shadow-md text-white text-center">
                <h3 className="font-bold text-sm mb-1">Start with AI</h3>
                <p className="text-xs text-blue-100 mb-3">Generate a complete site in seconds.</p>
                <button 
                    onClick={() => setIsAIModalOpen(true)}
                    className="w-full py-2 px-3 bg-white text-blue-600 text-xs font-bold rounded hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                    <span>🪄</span> Generate Site
                </button>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">{t('micrositeBuilder.siteSettings')}</h3>
                <button 
                    onClick={onOpenSettings}
                    className="w-full p-2 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                    {t('micrositeBuilder.editSiteSettings')}
                </button>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold mb-2">{t('micrositeBuilder.addBlock')}</h3>
                <div className="grid grid-cols-2 gap-2">
                    {blockTypes.map(block => (
                        <button 
                            key={block.type}
                            // onClick={() => onAddBlock(block.type)} // This would be implemented with state management
                            className="p-2 text-xs text-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200"
                        >
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
