import React, { useState, useMemo } from 'react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const filteredLeads = useMemo(() => {
        return leads.filter(l =>
            `${l.firstName} ${l.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5); // Keep recent leads list concise
    }, [leads, searchTerm]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => 
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    const handleAddCustomer = () => {
        setEditingCustomer(null);
        setIsModalOpen(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleDeleteCustomer = (customerId: string) => {
        if (window.confirm(t('crm.confirmDelete') as string)) {
            deleteCustomer(customerId);
        }
    };
    
    const handleSaveCustomer = (customerData: Customer) => {
        if (editingCustomer) {
            updateCustomer({ ...editingCustomer, ...customerData });
        } else {
            addCustomer(customerData);
        }
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('nav.customersAndLeads')}</h1>
                <button onClick={handleAddCustomer} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    {t('crm.addCustomer')}
                </button>
            </div>
            
            <div className="mb-6">
                 <input
                    type="text"
                    placeholder={t('crm.searchAll') as string}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
            </div>

            {error && <ErrorMessage message={error.message} />}

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{t('crm.recentLeads')}</h2>
                {isLoading ? <SkeletonLoader className="h-64 w-full" /> : <CrmLeadsTable leads={filteredLeads} />}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">{t('crm.customers')}</h2>
                {isLoading ? <SkeletonLoader className="h-64 w-full" /> : <CustomersTable customers={filteredCustomers} onEdit={handleEditCustomer} onDelete={handleDeleteCustomer} />}
            </div>

            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveCustomer}
                customer={editingCustomer}
                mode={editingCustomer ? 'edit' : 'add'}
            />
        </div>
    );
};

export default MicroCRM;