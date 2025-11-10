import React from 'react';
import { MicrositeBlock } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import HeroBlockPreview from './blocks/HeroBlockPreview';
import ProductsBlockPreview from './blocks/ProductsBlockPreview';
import TestimonialsBlockPreview from './blocks/TestimonialsBlockPreview';
import FaqBlockPreview from './blocks/FaqBlockPreview';
import ContactFormPreview from './blocks/ContactFormPreview';

interface SitePreviewProps {
    blocks: MicrositeBlock[];
}

const SitePreview: React.FC<SitePreviewProps> = ({ blocks }) => {
    const { t } = useLocalization();

    return (
        <div className="border dark:border-gray-600 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800 shadow-inner h-[80vh] overflow-y-auto">
            {blocks.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                    {t('micrositeBuilder.noBlocksPreview')}
                </div>
            )}
            {blocks.map(block => {
                switch (block.type) {
                    case 'hero': return <HeroBlockPreview key={block.id} {...block} />;
                    case 'products': return <ProductsBlockPreview key={block.id} {...block} />;
                    case 'testimonials': return <TestimonialsBlockPreview key={block.id} {...block} />;
                    case 'faq': return <FaqBlockPreview key={block.id} {...block} />;
                    case 'contact': return <ContactFormPreview key={block.id} {...block} />;
                    default: return null;
                }
            })}
        </div>
    );
};

export default SitePreview;
