import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Customer, Policy, PolicyType } from '../../types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Customer) => void;
  customer: Customer | null;
  mode: 'add' | 'edit';
}

const emptyCustomer: Omit<Customer, 'id' | 'timeline'> = {
  firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '', policies: []
};

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSubmit, customer, mode }) => {
  const { t } = useLocalization();
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'timeline'> | Customer>(
    customer || emptyCustomer
  );
  
  useEffect(() => {
    setFormData(customer || emptyCustomer);
  }, [customer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePolicyChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      const newPolicies = [...(formData.policies || [])];
      const policyToUpdate = { ...newPolicies[index], [name]: value };
      
      if(name === 'premium') policyToUpdate.premium = parseFloat(value) || 0;
      if(name === 'isActive') (policyToUpdate as any).isActive = e.target.value === 'true';

      newPolicies[index] = policyToUpdate as Policy;
      setFormData(prev => ({...prev, policies: newPolicies}));
  };
  
  const addPolicy = () => {
      const newPolicy: Policy = {
          id: `pol_${Date.now()}`,
          type: PolicyType.AUTO,
          policyNumber: '',
          premium: 0,
          startDate: '',
          endDate: '',
          isActive: true,
          insurer: '',
      };
      setFormData(prev => ({ ...prev, policies: [...(prev.policies || []), newPolicy]}));
  }
  
  const removePolicy = (index: number) => {
      setFormData(prev => ({ ...prev, policies: (prev.policies || []).filter((_, i) => i !== index) }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Customer);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">{t(mode === 'add' ? 'crm.addCustomer' : 'crm.editCustomer')}</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder={t('crm.form.firstName')} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder={t('crm.form.lastName')} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
            </div>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t('crm.form.email')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder={t('crm.form.phone')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder={t('crm.form.address')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} placeholder={t('crm.form.dob')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />

            <div className="pt-4">
                <h3 className="text-lg font-semibold mb-2">{t('crm.form.policies')}</h3>
                <div className="space-y-4">
                    {formData.policies && formData.policies.map((policy, index) => (
                        <div key={index} className="p-3 border rounded-md dark:border-gray-600 space-y-2 relative">
                             <button type="button" onClick={() => removePolicy(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input type="text" name="policyNumber" value={policy.policyNumber} onChange={(e) => handlePolicyChange(index, e)} placeholder={t('crm.form.policyNumber')} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <select name="type" value={policy.type} onChange={(e) => handlePolicyChange(index, e)} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    {/* FIX: Explicitly type 'pt' as a string to resolve the 'unknown' type error for the 'key' prop. */}
                                    {Object.values(PolicyType).map((pt: string) => <option key={pt} value={pt}>{t(`policyTypes.${pt}`)}</option>)}
                                </select>
                                <input type="text" name="insurer" value={policy.insurer} onChange={(e) => handlePolicyChange(index, e)} placeholder={t('crm.form.insurer')} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="number" name="premium" value={policy.premium} onChange={(e) => handlePolicyChange(index, e)} placeholder={t('crm.form.premium')} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="date" name="startDate" value={policy.startDate} onChange={(e) => handlePolicyChange(index, e)} placeholder={t('crm.form.startDate')} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="date" name="endDate" value={policy.endDate} onChange={(e) => handlePolicyChange(index, e)} placeholder={t('crm.form.endDate')} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <select name="isActive" value={String(policy.isActive)} onChange={(e) => handlePolicyChange(index, e)} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    <option value="true">{t('statusLabels.active')}</option>
                                    <option value="false">{t('statusLabels.inactive')}</option>
                                </select>
                             </div>
                        </div>
                    ))}
                </div>
                {(!formData.policies || formData.policies.length === 0) && <p className="text-sm text-gray-500">{t('crm.form.noPolicies')}</p>}
                <button type="button" onClick={addPolicy} className="mt-2 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500">+ {t('crm.form.addPolicy')}</button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('crm.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('crm.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;