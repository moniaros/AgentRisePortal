import React, { useState } from 'react';
import { MicrositeBlock, BlockType } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import BuilderControls from '../components/microsite/BuilderControls';
import SitePreview from '../components/microsite/SitePreview';

// Helper to create a unique ID
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createNewBlock = (type: BlockType): MicrositeBlock => {
    const common = { id: generateId('block') };
    switch (type) {
        case 'hero':
            return { ...common, type, title: 'Καλώς Ήρθατε', subtitle: 'Η αξιόπιστη ασφαλιστική σας λύση', ctaText: 'Λάβετε Προσφορά' };
        case 'products':
            return { ...common, type, title: 'Οι Υπηρεσίες Μας', products: [{ id: generateId('prod'), name: 'Ασφάλεια Αυτοκινήτου', description: 'Πλήρης κάλυψη για το όχημά σας.' }] };
        case 'testimonials':
            return { ...common, type, title: 'Τι Λένε οι Πελάτες Μας', testimonials: [{ id: generateId('test'), quote: 'Εξαιρετική εξυπηρέτηση και οι καλύτερες τιμές της αγοράς!', author: 'Γιάννης Π.' }] };
        case 'faq':
            return { ...common, type, title: 'Συχνές Ερωτήσεις', items: [{ id: generateId('faq'), question: 'Πώς μπορώ να πάρω προσφορά;', answer: 'Συμπληρώστε τη φόρμα επικοινωνίας και θα σας καλέσουμε άμεσα.' }] };
        case 'contact':
            return { ...common, type, title: 'Επικοινωνήστε Μαζί Μας', subtitle: 'Είμαστε εδώ για να σας βοηθήσουμε.' };
        default:
            throw new Error('Unknown block type');
    }
};

const MicrositeBuilder: React.FC = () => {
    const { t } = useLocalization();
    const [blocks, setBlocks] = useState<MicrositeBlock[]>([]);

    const addBlock = (type: BlockType) => {
        const newBlock = createNewBlock(type);
        setBlocks(prev => [...prev, newBlock]);
    };

    const removeBlock = (id: string) => {
        setBlocks(prev => prev.filter(block => block.id !== id));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const item = newBlocks.splice(index, 1)[0];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        newBlocks.splice(newIndex, 0, item);
        setBlocks(newBlocks);
    };

    const updateBlock = (updatedBlock: MicrositeBlock) => {
        setBlocks(prev => prev.map(block => block.id === updatedBlock.id ? updatedBlock : block));
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('micrositeBuilder.title')}</h1>
                <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition self-start sm:self-center">
                    {t('micrositeBuilder.saveSite')}
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls Panel */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">{t('micrositeBuilder.controlsTitle')}</h2>
                    <BuilderControls
                        blocks={blocks}
                        onAddBlock={addBlock}
                        onRemoveBlock={removeBlock}
                        onMoveBlock={moveBlock}
                        onUpdateBlock={updateBlock}
                    />
                </div>
                {/* Preview Panel */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">{t('micrositeBuilder.previewTitle')}</h2>
                    <SitePreview blocks={blocks} />
                </div>
            </div>
        </div>
    );
};

export default MicrositeBuilder;
