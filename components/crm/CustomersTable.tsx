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

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.name')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.form.phone')}</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('crm.form.policies')}</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {customers.map(customer => (
            <tr key={customer.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.firstName} {customer.lastName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.policies.length}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                <button onClick={() => navigate(`/customer/${customer.id}`)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200">{t('crm.viewProfile')}</button>
                <button onClick={() => onEdit(customer)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">{t('crm.edit')}</button>
                <button onClick={() => onDelete(customer.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">{t('crm.delete')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersTable;