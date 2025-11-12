import React, { useState } from 'react';
import { Policy, InsuredPartyACORD } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import EditableField from '../ui/EditableField';

interface DetailedPolicyViewProps {
  policy: Policy;
  onUpdatePolicy: (updatedPolicy: Policy) => void;
}

const getPolicyIcon = (type: string) => {
    switch (type) {
        case 'auto': return '🚗';
        case 'home': return '🏠';
        case 'life': return '❤️';
        case 'health': return '⚕️';
        default: return '📄';
    }
};

const DetailedPolicyView: React.FC<DetailedPolicyViewProps> = ({ policy, onUpdatePolicy }) => {
    const { t } = useLocalization();
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        coverages: true, // Default open
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCoverageUpdate = (index: number, field: string, value: any) => {
        const updatedCoverages = [...(policy.coverages || [])];
        (updatedCoverages[index] as any)[field] = value;
        onUpdatePolicy({ ...policy, coverages: updatedCoverages });
    };

    const handleBeneficiaryUpdate = (index: number, field: keyof InsuredPartyACORD, value: string) => {
        const updatedBeneficiaries = [...(policy.beneficiaries || [])];
        updatedBeneficiaries[index] = { ...updatedBeneficiaries[index], [field]: value };
        onUpdatePolicy({ ...policy, beneficiaries: updatedBeneficiaries });
    };

    const handleAddBeneficiary = () => {
        const newBeneficiary: InsuredPartyACORD = { name: 'New Beneficiary', address: '' };
        const updatedBeneficiaries = [...(policy.beneficiaries || []), newBeneficiary];
        onUpdatePolicy({ ...policy, beneficiaries: updatedBeneficiaries });
    };

    const handleRemoveBeneficiary = (index: number) => {
        const updatedBeneficiaries = (policy.beneficiaries || []).filter((_, i) => i !== index);
        onUpdatePolicy({ ...policy, beneficiaries: updatedBeneficiaries });
    };

    const isExpired = new Date(policy.endDate) < new Date();
    const statusClass = policy.isActive && !isExpired ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    const statusText = policy.isActive && !isExpired ? t('statusLabels.active') : (isExpired ? t('statusLabels.expired') : t('statusLabels.inactive'));

    return (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="text-4xl mt-1">{getPolicyIcon(policy.type)}</div>
                <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold">{t(`policyTypes.${policy.type}`)} - {policy.policyNumber}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{policy.insurer}</p>
                        </div>
                        <span className={`mt-2 sm:mt-0 px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}>{statusText}</span>
                    </div>
                </div>
            </div>

            {/* Collapsible Sections */}
            <div className="mt-4 space-y-2">
                <CollapsibleSection title="Policy Details" isOpen={openSections['details']} onToggle={() => toggleSection('details')}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm p-4">
                        <InfoItem label={t('crm.form.premium')} value={`€${policy.premium.toFixed(2)}`} />
                        <InfoItem label={t('crm.form.startDate')} value={new Date(policy.startDate).toLocaleDateString()} />
                        <InfoItem label={t('crm.form.endDate')} value={new Date(policy.endDate).toLocaleDateString()} />
                    </div>
                </CollapsibleSection>

                {policy.vehicle && (
                    <CollapsibleSection title="Vehicle Details" isOpen={openSections['vehicle']} onToggle={() => toggleSection('vehicle')}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm p-4">
                            <InfoItem label="Make" value={policy.vehicle.make} />
                            <InfoItem label="Model" value={policy.vehicle.model} />
                            <InfoItem label="Year" value={String(policy.vehicle.year)} />
                            <InfoItem label="VIN" value={policy.vehicle.vin} />
                        </div>
                    </CollapsibleSection>
                )}

                <CollapsibleSection title={t('customer.coverages')} isOpen={openSections['coverages']} onToggle={() => toggleSection('coverages')}>
                    <div className="overflow-x-auto p-2">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Type</th>
                                    <th className="px-4 py-2 text-left font-medium">Limit</th>
                                    <th className="px-4 py-2 text-left font-medium">Deductible</th>
                                    <th className="px-4 py-2 text-left font-medium">Premium</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {(policy.coverages || []).map((cov, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2">{cov.type}</td>
                                        <td className="px-4 py-2">
                                            <EditableField initialValue={cov.limit} onSave={(val) => handleCoverageUpdate(index, 'limit', val)} label="Coverage Limit" />
                                        </td>
                                        <td className="px-4 py-2">{cov.deductible || 'N/A'}</td>
                                        <td className="px-4 py-2">€{cov.premium?.toFixed(2) || '0.00'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CollapsibleSection>
                
                <CollapsibleSection title="Beneficiaries" isOpen={openSections['beneficiaries']} onToggle={() => toggleSection('beneficiaries')}>
                    <div className="p-4 space-y-3">
                        {(policy.beneficiaries || []).map((beneficiary, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-sm p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                                <div className="sm:col-span-2">
                                    <EditableField initialValue={beneficiary.name} onSave={(val) => handleBeneficiaryUpdate(index, 'name', val)} label="Beneficiary Name" />
                                </div>
                                <div className="sm:col-span-2">
                                     <EditableField initialValue={beneficiary.address} onSave={(val) => handleBeneficiaryUpdate(index, 'address', val)} label="Beneficiary Address" />
                                </div>
                                <div className="text-right">
                                    <button onClick={() => handleRemoveBeneficiary(index)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
                                </div>
                            </div>
                        ))}
                        <button onClick={handleAddBeneficiary} className="text-sm text-blue-500 hover:underline mt-2">+ Add Beneficiary</button>
                    </div>
                </CollapsibleSection>
            </div>
        </div>
    );
};

const CollapsibleSection: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, isOpen, onToggle, children }) => (
    <div className="border dark:border-gray-700 rounded-md">
        <button onClick={onToggle} className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-t-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200">{title}</h4>
            <span className={`transform transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}>▶</span>
        </button>
        {isOpen && <div>{children}</div>}
    </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="font-semibold text-gray-600 dark:text-gray-300">{label}</p>
        <p>{value}</p>
    </div>
);

export default DetailedPolicyView;