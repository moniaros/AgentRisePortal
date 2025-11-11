import React, { useState, useMemo } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import CustomersTable from '../components/crm/CustomersTable';
import CustomerFormModal from '../components/crm/CustomerFormModal';
import { Customer, Lead } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import LeadControls from '../components/leads/LeadControls';
import LeadsTable from '../components/leads/LeadsTable';
import LeadDetailModal from '../components/leads/LeadDetailModal';

const MicroCRM: React.FC = () => {
    const { t } = useLocalization();
    const { customers, leads, isLoading, error, addCustomer, updateCustomer, deleteCustomer } = useCrmData();
    
    const [filters, setFilters] = useState({ status: 'all', source: 'all', search: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const statusMatch = filters.status === 'all' || lead.status === filters.status;
            const sourceMatch = filters.source === 'all' || lead.source === filters.source;
            const searchLower = filters.search.toLowerCase();
            const searchMatch =
                lead.firstName.toLowerCase().includes(searchLower) ||
                lead.lastName.toLowerCase().includes(searchLower) ||
                lead.email.toLowerCase().includes(searchLower);
            return statusMatch && sourceMatch && searchMatch;
        });
    }, [leads, filters]);

    const filteredCustomers = useMemo(() => {
        const searchLower = filters.search.toLowerCase();
        return customers.filter(c => 
            `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchLower) ||
            c.email.toLowerCase().includes(searchLower)
        );
    }, [customers, filters.search]);

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
    
    const handleViewLeadDetails = (lead: Lead) => {
        setSelectedLead(lead);
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
                 <LeadControls filters={filters} onFilterChange={setFilters} allLeads={leads} />
            </div>

            {error && <ErrorMessage message={error.message} />}

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{t('leads.title')}</h2>
                {isLoading ? <SkeletonLoader className="h-64 w-full" /> : <LeadsTable leads={filteredLeads} onViewDetails={handleViewLeadDetails} />}
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
            
            {selectedLead && (
                <LeadDetailModal
                    lead={selectedLead}
                    isOpen={!!selectedLead}
                    onClose={() => setSelectedLead(null)}
                />
            )}
        </div>
    );
};

export default MicroCRM;