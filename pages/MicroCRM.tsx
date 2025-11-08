import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useCrmData } from '../hooks/useCrmData';
import { Customer } from '../types';
import CustomersTable from '../components/crm/CustomersTable';
import CrmLeadsTable from '../components/crm/CrmLeadsTable';
import CustomerFormModal from '../components/crm/CustomerFormModal';
import ErrorMessage from '../components/ui/ErrorMessage';

const MicroCRM: React.FC = () => {
    const { t } = useLocalization();
    const { customers, leads, isLoading, error, addCustomer, updateCustomer, deleteCustomer } = useCrmData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddCustomer = () => {
        setEditingCustomer(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setEditingCustomer(customer);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDeleteCustomer = (customerId: string) => {
        if (window.confirm(t('crm.confirmDelete'))) {
            deleteCustomer(customerId);
        }
    };
    
    const handleFormSubmit = (customerData: Customer) => {
        if (modalMode === 'add') {
            const { id, timeline, ...rest } = customerData;
            addCustomer(rest as Omit<Customer, 'id' | 'timeline'>);
        } else if (editingCustomer) {
            updateCustomer(customerData);
        }
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        return customers.filter(c =>
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div></div>;
    }

    if (error) {
        return <ErrorMessage message={error.message} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('crm.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('crm.description')}</p>
            
            <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:justify-between sm:items-center">
                <input
                    type="text"
                    placeholder={t('crm.searchCustomers')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full sm:w-1/3 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                    onClick={handleAddCustomer}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    + {t('crm.addCustomer')}
                </button>
            </div>
            
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{t('crm.customerList')}</h2>
                    <CustomersTable 
                        customers={filteredCustomers}
                        onEdit={handleEditCustomer}
                        onDelete={handleDeleteCustomer}
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">{t('crm.leadList')}</h2>
                    <CrmLeadsTable leads={leads} />
                </div>
            </div>

            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                customer={editingCustomer}
                mode={modalMode}
            />
        </div>
    );
};

export default MicroCRM;
