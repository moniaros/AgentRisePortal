
import React from 'react';
import { Lead } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface LeadsTableProps {
  leads: Lead[];
  onViewDetails: (lead: Lead) => void;
  onConvert?: (lead: Lead) => void;
}

const getStatusBadge = (status: string) => {
  const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 border";
  
  switch (status) {
    case 'new': 
      return <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800`}><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>New</span>;
    case 'contacted': 
      return <span className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800`}><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Contacted</span>;
    case 'qualified': 
      return <span className={`${baseClasses} bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800`}><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>Qualified</span>;
    case 'closed': 
      return <span className={`${baseClasses} bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800`}><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Closed</span>;
    case 'rejected': 
      return <span className={`${baseClasses} bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`}><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>Rejected</span>;
    default: 
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
  }
};

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onViewDetails, onConvert }) => {
  const { t } = useLocalization();

  // Mobile Card Component
  const LeadCardMobile: React.FC<{ lead: Lead }> = ({ lead }) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3">
          <div className="flex items-start justify-between mb-2">
              <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                      {lead.firstName} {lead.lastName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {lead.email}
                  </div>
              </div>
              {getStatusBadge(lead.status)}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3 mb-4">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                  <span>{lead.source.includes('Facebook') ? '🔵' : lead.source.includes('Instagram') ? '🟣' : '🌐'}</span>
                  <span>{lead.source}</span>
              </div>
              <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-900 dark:text-white">
                  €{lead.potentialValue.toFixed(2)}
              </div>
          </div>

          <div className="flex gap-2 pt-3 border-t dark:border-gray-700">
              <button 
                  onClick={() => onViewDetails(lead)}
                  className="flex-1 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-semibold active:bg-blue-100"
              >
                  {t('leads.viewDetails')}
              </button>
              {!lead.customerId && onConvert && (
                  <button 
                      onClick={() => onConvert(lead)}
                      className="flex-1 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-semibold active:bg-green-100"
                  >
                      {t('crm.convert')}
                  </button>
              )}
          </div>
      </div>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden">
          {leads.length > 0 ? (
              leads.map(lead => <LeadCardMobile key={lead.id} lead={lead} />)
          ) : (
              <div className="text-center py-8 text-gray-500">{t('leads.noLeadsFound')}</div>
          )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('crm.name')}</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('crm.status')}</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('leads.source')}</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('crm.potentialValue')}</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('leads.createdDate')}</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-slate-700">
              {leads.length > 0 ? leads.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-default group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{lead.firstName} {lead.lastName}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-lg">
                              {lead.source.includes('Facebook') ? '🔵' : lead.source.includes('Instagram') ? '🟣' : '🌐'}
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{lead.source}</span>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-white font-mono">€{lead.potentialValue.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onViewDetails(lead)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs uppercase tracking-wide">
                        {t('leads.viewDetails')}
                      </button>
                      {!lead.customerId && onConvert && (
                          <button onClick={() => onConvert(lead)} className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium text-xs uppercase tracking-wide">
                              {t('crm.convert')}
                          </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                          <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          <span className="text-sm">{t('leads.noLeadsFound')}</span>
                      </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default LeadsTable;
