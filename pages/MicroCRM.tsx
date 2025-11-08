import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useCrmData } from '../hooks/useCrmData';
import { Customer } from '../types';
import CustomerFormModal from '../components/crm/CustomerFormModal';
import CustomersTable from '../components/crm/CustomersTable';
import CrmLeadsTable from '../components/crm/CrmLeadsTable';

type ModalState = {
  isOpen: boolean;
  mode: 'add' | 'edit';
  customer: Customer | null;
};

const MicroCRM: React.FC = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'customers' | 'leads'>('customers');
  const { customers, leads, addCustomer, updateCustomer, deleteCustomer, isLoading, error } = useCrmData();
  const [searchTerm, setSearchTerm] = useState('');

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'add',
    customer: null,
  });

  const openModal = (mode: 'add' | 'edit', customer: Customer | null = null) => {
    setModalState({ isOpen: true, mode, customer });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'add', customer: null });
  };

  const handleFormSubmit = (customerData: Customer) => {
    if (modalState.mode === 'add') {
      addCustomer(customerData);
    } else {
      updateCustomer(customerData);
    }
    closeModal();
  };
  
  const handleDeleteCustomer = (customerId: string) => {
    if(window.confirm(t('crm.confirmDelete'))) {
        deleteCustomer(customerId);
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);
  
  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;
    }
    if (error) {
      return <div className="text-red-500 text-center p-8">{error.message}</div>;
    }
    if (activeTab === 'customers') {
      return <CustomersTable customers={filteredCustomers} onEdit={(customer) => openModal('edit', customer)} onDelete={handleDeleteCustomer} />;
    }
    return <CrmLeadsTable leads={filteredLeads} />;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('crm.title')}</h1>
        {activeTab === 'customers' && (
             <button onClick={() => openModal('add')} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                + {t('crm.addCustomer')}
             </button>
        )}
      </div>

      <div className="mb-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => setActiveTab('customers')} className={`${activeTab === 'customers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('crm.customers')}</button>
            <button onClick={() => setActiveTab('leads')} className={`${activeTab === 'leads' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>{t('crm.leads')}</button>
          </nav>
        </div>
      </div>
      
       <div className="mb-4">
        <input 
          type="text" 
          placeholder={t('crm.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {renderContent()}

      {modalState.isOpen && (
        <CustomerFormModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
          customer={modalState.customer}
          mode={modalState.mode}
        />
      )}
    </div>
  );
};

export default MicroCRM;