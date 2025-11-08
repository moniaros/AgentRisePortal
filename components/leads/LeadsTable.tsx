import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Lead } from '../../types';
import { useNavigate } from 'react-router-dom';

interface LeadsTableProps {
    leads: Lead[];
    tags: { [key: string]: string[] };
    onTagUpdate: (leadId: string, newTags: string[]) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, tags, onTagUpdate }) => {
    const { t } = useLocalization();
    const navigate = useNavigate();
    const [tagInput, setTagInput] = useState<{ [key: string]: string }>({});

    const addTag = (leadId: string) => {
        const newTag = tagInput[leadId]?.trim();
        if (!newTag) return;
        const currentTags = tags[leadId] || [];
        if (currentTags.includes(newTag)) return;
        onTagUpdate(leadId, [...currentTags, newTag]);
        setTagInput(prev => ({...prev, [leadId]: ''}));
    };

    const removeTag = (leadId: string, tagToRemove: string) => {
        const currentTags = tags[leadId] || [];
        onTagUpdate(leadId, currentTags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.name')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.source')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('leadGen.createdAt')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.status')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.potentialValue')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('leadGen.tags')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.actions')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {leads.length > 0 ? leads.map(lead => (
                        <tr key={lead.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{lead.firstName} {lead.lastName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{lead.source}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                    {t(`statusLabels.${lead.status}`)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">€{lead.potentialValue.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[200px]">
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {(tags[lead.id] || []).map(tag => (
                                        <span key={tag} className="flex items-center text-xs bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-1">
                                            {tag}
                                            <button onClick={() => removeTag(lead.id, tag)} className="ml-1.5 text-gray-500 dark:text-gray-300 hover:text-red-500 text-lg leading-none transform translate-y-[-1px]">&times;</button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="text"
                                        placeholder={t('leadGen.addTag')}
                                        value={tagInput[lead.id] || ''}
                                        onChange={(e) => setTagInput(prev => ({...prev, [lead.id]: e.target.value}))}
                                        onKeyDown={(e) => e.key === 'Enter' && addTag(lead.id)}
                                        className="w-24 text-xs p-1 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                    />
                                    <button onClick={() => addTag(lead.id)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">+</button>
                                </div>
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => navigate(`/customer/${lead.customerId}`)}
                                    disabled={!lead.customerId}
                                    className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed dark:text-blue-400 dark:hover:text-blue-200"
                                >
                                    {t('crm.viewProfile')}
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-gray-400">{t('leadGen.noLeads')}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LeadsTable;