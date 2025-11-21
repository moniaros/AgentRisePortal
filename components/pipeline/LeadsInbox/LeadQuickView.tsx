
import React from 'react';
import { TransactionInquiry, Language } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface LeadQuickViewProps {
    inquiry: TransactionInquiry | null;
    isOpen: boolean;
    onClose: () => void;
    onCreateOpportunity: (inquiry: TransactionInquiry) => void;
}

const LeadQuickView: React.FC<LeadQuickViewProps> = ({ inquiry, isOpen, onClose, onCreateOpportunity }) => {
    const { t, language } = useLocalization();

    if (!isOpen || !inquiry) return null;

    const scoreFactors = [
        { label: inquiry.source === 'Referral' ? 'High Trust Source' : 'Standard Source', impact: 'positive' },
        { label: inquiry.contact.phone ? 'Phone Verified' : 'No Phone', impact: inquiry.contact.phone ? 'positive' : 'neutral' },
        { label: inquiry.consentGDPR ? 'GDPR Consented' : 'GDPR Missing', impact: inquiry.consentGDPR ? 'positive' : 'negative' },
        { label: 'Policy Intent: ' + inquiry.policyType, impact: 'neutral' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/20 pointer-events-auto transition-opacity" 
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl pointer-events-auto flex flex-col transform transition-transform animate-fade-in border-l dark:border-gray-700">
                
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {inquiry.contact.firstName} {inquiry.contact.lastName}
                            </h2>
                            <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                                New Lead
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">{inquiry.contact.email}</p>
                        <p className="text-sm text-gray-500">{inquiry.contact.phone}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    
                    {/* Score Card */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                        <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-3">
                            {language === Language.EL ? 'Ανάλυση Ποιότητας' : 'Lead Intelligence'}
                        </h3>
                        <div className="space-y-2">
                            {scoreFactors.map((factor, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                    <span className={factor.impact === 'positive' ? 'text-green-500' : factor.impact === 'negative' ? 'text-red-500' : 'text-gray-400'}>
                                        {factor.impact === 'positive' ? '✔' : factor.impact === 'negative' ? '✖' : '•'}
                                    </span>
                                    <span className="text-gray-700 dark:text-gray-300">{factor.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Context / Details */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Inquiry Context</h3>
                        <div className="p-3 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300 italic">
                            "{inquiry.details || 'No specific details provided.'}"
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 border dark:border-gray-600">
                                Source: {inquiry.source}
                            </span>
                            {inquiry.attribution?.utm_campaign && (
                                <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-800">
                                    Campaign: {inquiry.attribution.utm_campaign}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Simulated Mini Timeline */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                        <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-1 space-y-4 pl-4 py-1">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Inquiry Received</p>
                                <p className="text-xs text-gray-500">{new Date(inquiry.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Visited Pricing Page</p>
                                <p className="text-xs text-gray-500">2 mins before inquiry</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sticky Footer Actions */}
                <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2">
                        <a href={`tel:${inquiry.contact.phone}`} className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-600 transition">
                            <span className="text-lg">📞</span>
                            <span className="text-[10px] font-bold uppercase mt-1">Call</span>
                        </a>
                        <a href={`mailto:${inquiry.contact.email}`} className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-blue-600 transition">
                            <span className="text-lg">✉️</span>
                            <span className="text-[10px] font-bold uppercase mt-1">Email</span>
                        </a>
                        <a href={`https://wa.me/${inquiry.contact.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-green-600 transition">
                            <span className="text-lg">💬</span>
                            <span className="text-[10px] font-bold uppercase mt-1">WhatsApp</span>
                        </a>
                    </div>
                    <button 
                        onClick={() => onCreateOpportunity(inquiry)}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 shadow-lg transition flex items-center justify-center gap-2"
                    >
                        {t('pipeline.createOpportunity')} &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadQuickView;
