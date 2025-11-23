
import React, { useState, useMemo, useRef } from 'react';
import { useCrmData } from '../hooks/useCrmData';
import { useLocalization } from '../hooks/useLocalization';
import CustomersTable from '../components/crm/CustomersTable';
import CustomerFormModal from '../components/crm/CustomerFormModal';
import { Customer, Lead, DetailedPolicy, PolicyType } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import LeadsTable from '../components/leads/LeadsTable';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import { useNotification } from '../hooks/useNotification';
import { GoogleGenAI, Type } from '@google/genai';
import { fileToBase64 } from '../services/utils';
import { mapToPolicyACORD, mapAcordToCrmPolicy } from '../services/acordMapper';

const MicroCRM: React.FC = () => {
    const { t } = useLocalization();
    const { customers, leads, isLoading, error, addCustomer, updateCustomer, deleteCustomer, convertLeadToCustomer } = useCrmData();
    const { addNotification } = useNotification();
    
    const [filters, setFilters] = useState({ status: 'all', source: 'all', search: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    
    // Smart Import State
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredLeads = useMemo(() => {
        const recentLeads = leads
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .filter(lead => !lead.customerId)
            .slice(0, 5);

        return recentLeads.filter(lead => {
            const searchLower = filters.search.toLowerCase();
            const searchMatch =
                lead.firstName.toLowerCase().includes(searchLower) ||
                lead.lastName.toLowerCase().includes(searchLower) ||
                lead.email.toLowerCase().includes(searchLower);
            return searchMatch;
        });
    }, [leads, filters.search]);

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
            addNotification('Customer profile updated successfully.', 'success');
        } else {
            addCustomer(customerData);
            addNotification('New customer added successfully.', 'success');
        }
        setIsModalOpen(false);
        setEditingCustomer(null);
    };
    
    const handleViewLeadDetails = (lead: Lead) => {
        setSelectedLead(lead);
    };
    
    const handleConvertLead = (lead: Lead) => {
        convertLeadToCustomer(lead);
        setSelectedLead(null); 
        addNotification('Lead converted to customer.', 'success');
    };

    const handleSmartImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!process.env.API_KEY) {
            addNotification(t('dashboard.errors.noApiKey') as string, 'error');
            return;
        }

        setIsImporting(true);
        try {
            const base64Data = await fileToBase64(file);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const prompt = `
                Extract customer and policy information from this insurance document.
                Map it to the following structure. If specific fields are missing, use reasonable defaults or empty strings.
                
                Required Output JSON Structure:
                {
                    "firstName": string,
                    "lastName": string,
                    "email": string,
                    "phone": string,
                    "address": string,
                    "policy": {
                        "policyNumber": string,
                        "insurer": string,
                        "startDate": string (YYYY-MM-DD),
                        "endDate": string (YYYY-MM-DD),
                        "premium": number,
                        "type": string (auto, home, life, health)
                    }
                }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: file.type, data: base64Data } },
                        { text: prompt }
                    ]
                },
                config: {
                    responseMimeType: 'application/json'
                }
            });

            const jsonStr = response.text;
            if (!jsonStr) throw new Error("No data returned from AI");
            
            const extractedData = JSON.parse(jsonStr);
            
            // Map to Customer Object for the form
            // Create a mock ACORD-like policy to use our mapper logic, or map directly
            const prefilledPolicy = {
                id: `pol_${Date.now()}`,
                type: extractedData.policy.type || PolicyType.AUTO,
                policyNumber: extractedData.policy.policyNumber || '',
                insurer: extractedData.policy.insurer || '',
                premium: extractedData.policy.premium || 0,
                startDate: extractedData.policy.startDate || new Date().toISOString().split('T')[0],
                endDate: extractedData.policy.endDate || new Date().toISOString().split('T')[0],
                isActive: true,
                coverages: []
            };

            const prefilledCustomer: any = {
                firstName: extractedData.firstName || '',
                lastName: extractedData.lastName || '',
                email: extractedData.email || '',
                phone: extractedData.phone || '',
                address: extractedData.address || '',
                policies: [prefilledPolicy],
                communicationPreferences: ['email']
            };

            setEditingCustomer(null); // Ensure we are in "Add" mode
            setEditingCustomer(prefilledCustomer); // Abuse state slightly to pass data to modal
            setIsModalOpen(true);
            addNotification('Document parsed successfully. Please review.', 'success');

        } catch (error) {
            console.error("Smart Import failed", error);
            addNotification('Failed to parse document. Please try manually.', 'error');
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // If editingCustomer has an ID, it's a real edit. If not, it's a "Smart Import" pre-fill or new add.
    const modalMode = editingCustomer && 'id' in editingCustomer ? 'edit' : 'add';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('nav.customersAndLeads')}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your client relationships and growth opportunities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,.jpg,.png,.jpeg" 
                        onChange={handleFileChange}
                    />
                    <button 
                        onClick={handleSmartImportClick} 
                        disabled={isImporting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm disabled:opacity-50"
                    >
                        {isImporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Scanning...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span>Smart Import</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={handleAddCustomer} 
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        {t('crm.addCustomer')}
                    </button>
                </div>
            </div>
            
            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex gap-4">
                 <div className="relative flex-grow max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder={t('crm.searchAll') as string}
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value}))}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
                    />
                </div>
            </div>

            {error && <ErrorMessage message={error.message} />}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Leads Sidebar */}
                <div className="xl:col-span-1 space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                        {t('crm.recentLeads')}
                    </h2>
                    {isLoading ? <SkeletonLoader className="h-48 w-full" /> : <LeadsTable leads={filteredLeads} onViewDetails={handleViewLeadDetails} onConvert={handleConvertLead} />}
                </div>

                {/* Main Customer List */}
                <div className="xl:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        {t('crm.customers')} ({filteredCustomers.length})
                    </h2>
                    {isLoading ? <SkeletonLoader className="h-96 w-full" /> : <CustomersTable customers={filteredCustomers} onEdit={handleEditCustomer} onDelete={handleDeleteCustomer} />}
                </div>
            </div>

            <CustomerFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingCustomer(null); }}
                onSubmit={handleSaveCustomer}
                customer={editingCustomer}
                mode={modalMode}
            />
            
            {selectedLead && (
                <LeadDetailModal
                    lead={selectedLead}
                    isOpen={!!selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onConvert={handleConvertLead}
                />
            )}
        </div>
    );
};

export default MicroCRM;
