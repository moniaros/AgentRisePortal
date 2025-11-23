
import React from 'react';
import { Customer } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useNavigate } from 'react-router-dom';

interface CustomersTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({ customers, onEdit, onDelete }) => {
  const { t } = useLocalization();
  const navigate = useNavigate();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getCustomerStatus = (customer: Customer) => {
    const hasActivePolicy = customer.policies.some(p => p.isActive);
    return hasActivePolicy ? 'active' : 'inactive';
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border ${
      status === 'active' 
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
        : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
    }`}>
      {status === 'active' ? t('statusLabels.active') : t('statusLabels.inactive')}
    </span>
  );

  // Mobile Card Component
  const CustomerCardMobile: React.FC<{ customer: Customer }> = ({ customer }) => {
      const status = getCustomerStatus(customer);
      return (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3">
              <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm border border-blue-200 dark:border-blue-800">
                              {getInitials(customer.firstName, customer.lastName)}
                          </div>
                      </div>
                      <div className="ml-3">
                          <div className="text-base font-bold text-slate-900 dark:text-white">
                              {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                              {customer.policies.length} {t('crm.form.policies')}
                          </div>
                      </div>
                  </div>
                  <StatusBadge status={status} />
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase font-bold">{t('crm.form.email')}</span>
                      <span className="text-gray-700 dark:text-gray-300 truncate">{customer.email || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase font-bold">{t('crm.form.phone')}</span>
                      <span className="text-gray-700 dark:text-gray-300">{customer.phone || '-'}</span>
                  </div>
              </div>

              <div className="flex justify-between gap-2 pt-3 border-t dark:border-gray-700">
                  <button 
                      onClick={() => navigate(`/customer/${customer.id}`)}
                      className="flex-1 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-semibold text-center active:bg-blue-100 transition-colors"
                  >
                      {t('crm.viewProfile')}
                  </button>
                  <div className="flex gap-2">
                      {customer.phone && (
                          <a href={`tel:${customer.phone}`} className="p-3 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg active:bg-green-100">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          </a>
                      )}
                      <button 
                          onClick={() => onEdit(customer)}
                          className="p-3 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg active:bg-indigo-100"
                      >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                          onClick={() => onDelete(customer.id)}
                          className="p-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg active:bg-red-100"
                      >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <>
      {/* Mobile View (Card Layout) */}
      <div className="md:hidden">
          {customers.length > 0 ? (
              customers.map(customer => (
                  <CustomerCardMobile key={customer.id} customer={customer} />
              ))
          ) : (
              <div className="text-center py-8 text-gray-500">{t('leads.noLeadsFound')}</div>
          )}
      </div>

      {/* Desktop View (Table Layout) */}
      <div className="hidden md:block bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('crm.name')}
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('crm.form.email')}
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('crm.status')}
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('crm.form.policies')}
                </th>
                <th scope="col" className="relative px-6 py-4">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-slate-200 dark:divide-slate-700">
              {customers.map((customer) => {
                const status = getCustomerStatus(customer);
                return (
                  <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm border border-blue-200 dark:border-blue-800">
                            {getInitials(customer.firstName, customer.lastName)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {customer.phone || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-300">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {customer.policies.length} {customer.policies.length === 1 ? 'Policy' : t('crm.form.policies')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/customer/${customer.id}`)} 
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title={t('crm.viewProfile') as string}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button 
                          onClick={() => onEdit(customer)} 
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title={t('crm.edit') as string}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => onDelete(customer.id)} 
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t('crm.delete') as string}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CustomersTable;
