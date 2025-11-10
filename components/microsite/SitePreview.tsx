import React from 'react';
import { MicrositeBlock, MicrositeConfig } from '../../types';
import MicrositeHeader from './MicrositeHeader';
import MicrositeFooter from './MicrositeFooter';

// Dynamically import all block previews
import HeroBlockPreview from './blocks/HeroBlockPreview';
import AboutBlockPreview from './blocks/AboutBlockPreview';
import ServicesBlockPreview from './blocks/ProductsBlockPreview';
import TeamBlockPreview from './blocks/TeamBlockPreview';
import TestimonialsBlockPreview from './blocks/TestimonialsBlockPreview';
import FaqBlockPreview from './blocks/FaqBlockPreview';
import ContactFormPreview from './blocks/ContactFormPreview';
import NewsBlockPreview from './blocks/NewsBlockPreview';
import AwardsBlockPreview from './blocks/AwardsBlockPreview';
import CertificatesBlockPreview from './blocks/CertificatesBlockPreview';
import PolicyHighlightsBlockPreview from './blocks/PolicyHighlightsBlockPreview';
import LocationBlockPreview from './blocks/LocationBlockPreview';
import VideoBlockPreview from './blocks/VideoBlockPreview';
import DownloadsBlockPreview from './blocks/DownloadsBlockPreview';


interface SitePreviewProps {
    blocks: MicrositeBlock[];
    config: MicrositeConfig;
    onSelectBlock: (id: string) => void;
    selectedBlockId: string | null;
}

const blockComponentMap = {
    hero: HeroBlockPreview,
    about: AboutBlockPreview,
    services: ServicesBlockPreview,
    team: TeamBlockPreview,
    testimonials: TestimonialsBlockPreview,
    faq: FaqBlockPreview,
    contact: ContactFormPreview,
    news: NewsBlockPreview,
    awards: AwardsBlockPreview,
    certificates: CertificatesBlockPreview,
    policy_highlights: PolicyHighlightsBlockPreview,
    location: LocationBlockPreview,
    video: VideoBlockPreview,
    downloads: DownloadsBlockPreview,
};

const SitePreview: React.FC<SitePreviewProps> = ({ blocks, config, onSelectBlock, selectedBlockId }) => {
    return (
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
            <MicrositeHeader config={config} blocks={blocks} />
            <div className="max-w-5xl mx-auto">
                {blocks.map(block => {
                    const BlockComponent = blockComponentMap[block.type];
                    if (!BlockComponent) return <div key={block.id}>Unknown block type: {block.type}</div>;
                    
                    const isSelected = block.id === selectedBlockId;
                    
                    return (
                        <div 
                            key={block.id} 
                            id={block.id} 
                            onClick={() => onSelectBlock(block.id)}
                            className={`cursor-pointer relative p-2 ${isSelected ? 'outline-dashed outline-2 outline-blue-500' : ''}`}
                        >
                            {/* @ts-ignore */}
                            <BlockComponent {...block} />
                        </div>
                    );
                })}
            </div>
            <MicrositeFooter config={config} />
        </div>
    );
};

export default SitePreview;
