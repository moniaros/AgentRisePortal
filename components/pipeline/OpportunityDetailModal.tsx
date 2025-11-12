import React from 'react';
import { Opportunity__EXT, Prospect, Interaction } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface OpportunityDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    opportunity: Opportunity__EXT | null;
    prospect: Prospect | null;
    interactions: Interaction[];
}

const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({ isOpen, onClose, opportunity, prospect, interactions }) => {
    const { t } = useLocalization();

    if (!isOpen || !opportunity) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{opportunity.title}</h2>
                    <p className="text-sm text-gray-500">{prospect?.firstName} {prospect?.lastName}</p>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Details Section */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="font-semibold text-gray-500">Value</p>
                            <p>€{opportunity.value.toLocaleString()}</p>
                        </div>
                         <div>
                            <p className="font-semibold text-gray-500">Stage</p>
                            <p className="capitalize">{t(`pipeline.stages.${opportunity.stage}`)}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-500">Follow-up</p>
                            <p>{opportunity.nextFollowUpDate ? new Date(opportunity.nextFollowUpDate).toLocaleDateString() : 'Not set'}</p>
                        </div>
                    </div>
                    {/* Interaction Timeline */}
                    <div>
                        <h3 className="font-semibold mb-2">Activity Timeline</h3>
                        <div className="space-y-3">
                            {interactions.map(interaction => (
                                <div key={interaction.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                                        <span className="font-medium capitalize">{interaction.channel} ({interaction.direction})</span>
                                        <span>{new Date(interaction.createdAt).toLocaleString()}</span>
                                    </p>
                                    <p className="text-sm mt-1">{interaction.content}</p>
                                </div>
                            ))}
                            {interactions.length === 0 && <p className="text-sm text-gray-400">No activities logged yet.</p>}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpportunityDetailModal;
