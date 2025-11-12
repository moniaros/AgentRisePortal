import React, { useState, useEffect } from 'react';
import { StoredFinding } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface SuggestionCardProps {
    finding: StoredFinding;
    onConfirm: () => void;
    onDismiss: () => void;
    onSave: (findingId: string, newContent: { title: string, description: string, benefit?: string }) => void;
}

const getIconForType = (type: StoredFinding['type']) => {
    switch (type) {
        case 'gap': return { icon: '⚠️', color: 'text-red-500' };
        case 'upsell': return { icon: '💡', color: 'text-blue-500' };
        case 'cross-sell': return { icon: '➕', color: 'text-purple-500' };
        default: return { icon: '📌', color: 'text-gray-500' };
    }
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({ finding, onConfirm, onDismiss, onSave }) => {
    const { t } = useLocalization();
    const [isEditing, setIsEditing] = useState(false);
    const [editableFinding, setEditableFinding] = useState({
        title: finding.title,
        description: finding.description,
        benefit: finding.benefit || '',
    });

    useEffect(() => {
        setEditableFinding({
            title: finding.title,
            description: finding.description,
            benefit: finding.benefit || '',
        });
    }, [finding]);

    const { icon, color } = getIconForType(finding.type);

    const handleSave = () => {
        onSave(finding.id, editableFinding);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditableFinding({
            title: finding.title,
            description: finding.description,
            benefit: finding.benefit || '',
        });
        setIsEditing(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="flex items-start gap-3">
                <span className={`text-2xl mt-1 ${color}`}>{icon}</span>
                <div className="flex-grow">
                    {isEditing ? (
                        <div className="space-y-2">
                             <input 
                                value={editableFinding.title}
                                onChange={(e) => setEditableFinding(prev => ({...prev, title: e.target.value}))}
                                className="w-full p-1 border rounded dark:bg-gray-700 text-sm font-semibold"
                            />
                            <textarea 
                                value={editableFinding.description}
                                onChange={(e) => setEditableFinding(prev => ({...prev, description: e.target.value}))}
                                className="w-full p-1 border rounded dark:bg-gray-700 text-sm"
                                rows={2}
                            />
                             {finding.type !== 'gap' && (
                                <textarea 
                                    value={editableFinding.benefit}
                                    onChange={(e) => setEditableFinding(prev => ({...prev, benefit: e.target.value}))}
                                    className="w-full p-1 border rounded dark:bg-gray-700 text-sm"
                                    placeholder="Benefit to customer"
                                    rows={1}
                                />
                            )}
                        </div>
                    ) : (
                        <div>
                            <h4 className="font-semibold">{finding.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{finding.description}</p>
                            {finding.benefit && <p className="text-xs text-gray-500 mt-1"><strong>Benefit:</strong> {finding.benefit}</p>}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t dark:border-gray-700">
                {isEditing ? (
                    <>
                        <button onClick={handleCancel} className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">{t('customer.review.cancel')}</button>
                        <button onClick={handleSave} className="px-3 py-1 text-xs bg-blue-600 text-white rounded">{t('customer.review.save')}</button>
                    </>
                ) : (
                    <>
                        <button onClick={onDismiss} className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200">{t('customer.review.dismiss')}</button>
                        <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-200">{t('customer.review.edit')}</button>
                        <button onClick={onConfirm} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">{t('customer.review.confirm')}</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default SuggestionCard;