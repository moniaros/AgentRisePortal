import React, { useState, useMemo } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useCrmData } from '../hooks/useCrmData';
import LeadControls from '../components/leads/LeadControls';
import LeadsTable from '../components/leads/LeadsTable';
import LeadDetailModal from '../components/leads/LeadDetailModal';
// FIX: Correct import path
import { Lead } from '../types';
import ErrorMessage from '../components/ui/ErrorMessage';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const LeadGeneration: React.FC = () => {
  const { t } = useLocalization();
  const { leads, isLoading, error, convertLeadToCustomer } = useCrmData();
  const [filters, setFilters] = useState({ status: 'all', source: 'all', search: '' });
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

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
  };
  
  const handleCloseModal = () => {
      setSelectedLead(null);
  }

  const handleConvert = (lead: Lead) => {
    convertLeadToCustomer(lead);
    setSelectedLead(null); // Close modal if open
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('nav.leadGen')}</h1>
      
      {error && <ErrorMessage message={error.message} />}

      <LeadControls filters={filters} onFilterChange={setFilters} allLeads={leads} />

      <div className="mt-6">
        {isLoading ? (
          <SkeletonLoader className="h-64 w-full" />
        ) : (
          <LeadsTable leads={filteredLeads} onViewDetails={handleViewDetails} onConvert={handleConvert} />
        )}
      </div>

      {selectedLead && (
          <LeadDetailModal
            lead={selectedLead}
            isOpen={!!selectedLead}
            onClose={handleCloseModal}
            onConvert={handleConvert}
          />
      )}
    </div>
  );
};

export default LeadGeneration;