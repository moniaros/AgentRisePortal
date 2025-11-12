import React from 'react';
import { TransactionInquiry } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface LeadRowProps {
    inquiry: TransactionInquiry;
    onCreateOpportunity: (inquiry: TransactionInquiry) => void;
}

const LeadRow: React.FC<LeadRowProps> = ({ inquiry, onCreateOpportunity }) => {
    const { t } = useLocalization();

    return (
        <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-grow">
                <div className="flex items-center gap-4">
                    <p className="font-semibold text-lg">{inquiry.contact.firstName} {inquiry.contact.lastName}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${inquiry.consentGDPR ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {inquiry.consentGDPR ? 'GDPR OK' : 'No Consent'}
                    </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>{inquiry.contact.email}</span> | <span>{inquiry.contact.phone}</span>
                </div>
            </div>
            <div className="flex-shrink-0 flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
                 <div className="text-right">
                    <p className="font-medium">{inquiry.source}</p>
                    <p className="text-xs text-gray-500">{new Date(inquiry.createdAt).toLocaleString()}</p>
                </div>
                <button 
                    onClick={() => onCreateOpportunity(inquiry)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    {t('pipeline.createOpportunity')}
                </button>
            </div>
        </div>
    );
};

export default LeadRow;
