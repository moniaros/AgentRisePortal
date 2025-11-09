import React, { useState } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import CustomersTable from '../components/crm/CustomersTable';
import CrmLeadsTable from '../components/crm/CrmLeadsTable';
import CustomerFormModal from '../components/crm/CustomerFormModal';
import { Customer } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const MicroCRM: React.FC = () => {
    const { t } = useLocalization();
    const { customers, leads, isLoading, error, addCustomer, updateCustomer, deleteCustomer } = useCrmData();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const handleOpenAddModal = () => {
        setEditingCustomer(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        setModalMode('edit');
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleFormSubmit = (customerData: Customer) => {
        if (modalMode === 'add') {
            addCustomer(customerData as Omit<Customer, 'id' | 'timeline'>);
        } else {
            updateCustomer(customerData);
        }
        handleCloseModal();
    };
    
    const handleDeleteCustomer = (customerId: string) => {
        if (window.confirm(t('crm.confirmDelete'))) {
            deleteCustomer(customerId);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.crm')}</h1>
                <button 
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    {t('crm.addCustomer')}
                </button>
            </div>
            
            {error && <ErrorMessage message={error.message} />}

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">{t('crm.customers')}</h2>
                    {isLoading ? (
                        <SkeletonLoader className="h-48 w-full" />
                    ) : (
                        <CustomersTable 
                            customers={customers} 
                            onEdit={handleOpenEditModal} 
                            onDelete={handleDeleteCustomer}
                        />
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">{t('crm.leads')}</h2>
                     {isLoading ? (
                        <SkeletonLoader className="h-48 w-full" />
                    ) : (
                        <CrmLeadsTable leads={leads} />
                    )}
                </div>
            </div>

            <CustomerFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                customer={editingCustomer}
                mode={modalMode}
            />
        </div>
    );
};

export default MicroCRM;
