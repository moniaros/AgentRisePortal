import React from 'react';
import { MicrositeBlock, MicrositeSettings } from '../../types';
import HeroBlockPreview from './blocks/HeroBlockPreview';
import ProductsBlockPreview from './blocks/ProductsBlockPreview';
import TestimonialsBlockPreview from './blocks/TestimonialsBlockPreview';
import FaqBlockPreview from './blocks/FaqBlockPreview';
import ContactFormPreview from './blocks/ContactFormPreview';
import MicrositeHeader from './MicrositeHeader';
import MicrositeFooter from './MicrositeFooter';

interface SitePreviewProps {
    blocks: MicrositeBlock[];
    settings: MicrositeSettings;
}

const SitePreview: React.FC<SitePreviewProps> = ({ blocks, settings }) => {
    const renderBlock = (block: MicrositeBlock) => {
        switch (block.type) {
            case 'hero': return <HeroBlockPreview {...block} />;
            case 'products': return <ProductsBlockPreview {...block} />;
            case 'testimonials': return <TestimonialsBlockPreview {...block} />;
            case 'faq': return <FaqBlockPreview {...block} />;
            case 'contact': return <ContactFormPreview {...block} />;
            default: return null;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
           <MicrositeHeader settings={settings} />
            <main className="p-4">
                {blocks.map(block => (
                    <div key={block.id}>
                        {renderBlock(block)}
                    </div>
                ))}
            </main>
            <MicrositeFooter settings={settings} />
        </div>
    );
};

export default SitePreview;
