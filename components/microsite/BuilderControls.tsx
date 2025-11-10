import React, { useState } from 'react';
import { MicrositeBlock, BlockType } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import BlockEditor from './BlockEditor';

interface BuilderControlsProps {
    blocks: MicrositeBlock[];
    onAddBlock: (type: BlockType) => void;
    onRemoveBlock: (id: string) => void;
    onMoveBlock: (index: number, direction: 'up' | 'down') => void;
    onUpdateBlock: (updatedBlock: MicrositeBlock) => void;
}

const BuilderControls: React.FC<BuilderControlsProps> = ({ blocks, onAddBlock, onRemoveBlock, onMoveBlock, onUpdateBlock }) => {
    const { t } = useLocalization();
    const [newBlockType, setNewBlockType] = useState<BlockType | ''>('');
    const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

    const handleAddBlock = () => {
        if (newBlockType) {
            onAddBlock(newBlockType);
            setNewBlockType('');
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedBlockId(prev => (prev === id ? null : id));
    };

    const blockTypes: BlockType[] = ['hero', 'products', 'testimonials', 'faq', 'contact'];

    return (
        <div className="space-y-4">
            {/* Add Block Form */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-2">
                <select
                    value={newBlockType}
                    onChange={e => setNewBlockType(e.target.value as BlockType)}
                    className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                    <option value="" disabled>{t('micrositeBuilder.selectBlock')}</option>
                    {blockTypes.map(type => (
                        <option key={type} value={type}>{t(`micrositeBuilder.blocks.${type}`)}</option>
                    ))}
                </select>
                <button
                    onClick={handleAddBlock}
                    disabled={!newBlockType}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {t('micrositeBuilder.addBlock')}
                </button>
            </div>

            {/* Existing Blocks List */}
            <div className="space-y-2">
                {blocks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">{t('micrositeBuilder.noBlocks')}</div>
                )}
                {blocks.map((block, index) => (
                    <div key={block.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all">
                        <div className="flex items-center p-3 border-b dark:border-gray-700">
                            <h3 className="flex-grow font-semibold">{t(`micrositeBuilder.blocks.${block.type}`)}</h3>
                            <div className="flex items-center gap-1">
                                <button onClick={() => onMoveBlock(index, 'up')} disabled={index === 0} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30" aria-label={t('micrositeBuilder.controls.moveUp')}>▲</button>
                                <button onClick={() => onMoveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30" aria-label={t('micrositeBuilder.controls.moveDown')}>▼</button>
                                <button onClick={() => toggleExpand(block.id)} className="p-1.5 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t('micrositeBuilder.controls.edit')}>
                                    {expandedBlockId === block.id ? t('micrositeBuilder.controls.collapse') : t('micrositeBuilder.controls.edit')}
                                </button>
                                <button onClick={() => onRemoveBlock(block.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full" aria-label={t('micrositeBuilder.controls.remove')}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        {expandedBlockId === block.id && (
                            <div className="p-4">
                                <BlockEditor block={block} onUpdate={onUpdateBlock} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BuilderControls;
