
import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useLocalization } from '../../hooks/useLocalization';
import { Customer, Policy, PolicyType } from '../../types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Customer) => void;
  customer: Customer | null;
  mode: 'add' | 'edit';
}

const emptyCustomer: Omit<Customer, 'id' | 'timeline' | 'agencyId'> = {
  firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '', policies: [], communicationPreferences: []
};

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSubmit, customer, mode }) => {
  const { t } = useLocalization();
  
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<Customer>({
    defaultValues: customer || emptyCustomer
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "policies",
    keyName: "fieldId",
  });

  useEffect(() => {
    if (isOpen) {
      reset(customer || emptyCustomer);
    }
  }, [customer, isOpen, reset]);

  const handleFormSubmit = (data: Customer) => {
    onSubmit(data);
  };
  
  const addPolicy = () => {
      append({
          id: `pol_${Date.now()}`,
          type: PolicyType.AUTO,
          policyNumber: '',
          premium: 0,
          startDate: '',
          endDate: '',
          isActive: true,
          insurer: '',
          coverages: [],
      });
  }

  if (!isOpen) return null;

  const renderError = (error: any) => error?.message ? <span className="text-red-500 text-xs mt-1 block">{error.message as string}</span> : null;

  const SectionHeader = ({ title }: { title: string }) => (
      <div className="pb-2 mb-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center sm:p-4 transition-opacity">
      <div className="bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl sm:max-w-3xl flex flex-col overflow-hidden animate-fade-in">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
          
          {/* Header */}
          <div className="px-6 py-4 sm:px-8 sm:py-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center flex-shrink-0">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {t(mode === 'add' ? 'crm.addCustomer' : 'crm.editCustomer') as string}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {mode === 'add' ? 'Create a new customer profile.' : 'Update existing customer details.'}
                </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-grow space-y-8 pb-24 sm:pb-8">
            
            {/* Personal Information */}
            <section>
                <SectionHeader title={t('gapAnalysis.dataReviewModal.sections.policyholder') as string} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('crm.form.firstName') as string}</label>
                        <input type="text" {...register("firstName", { required: t('validation.required', {fieldName: t('crm.form.firstName')}) as string })} className={`w-full px-3 py-3 sm:py-2 border rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base sm:text-sm ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                        {renderError(errors.firstName)}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('crm.form.lastName') as string}</label>
                        <input type="text" {...register("lastName", { required: t('validation.required', {fieldName: t('crm.form.lastName')}) as string })} className={`w-full px-3 py-3 sm:py-2 border rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base sm:text-sm ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                        {renderError(errors.lastName)}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('crm.form.dob') as string}</label>
                        <input type="date" {...register("dateOfBirth")} className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base sm:text-sm" />
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section>
                <SectionHeader title={t('gapAnalysis.dataReviewModal.sections.policyholder') as string} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('crm.form.email') as string}</label>
                        <input type="email" {...register("email", { required: t('validation.required', {fieldName: t('crm.form.email')}) as string, pattern: { value: /^\S+@\S+$/i, message: t('validation.invalidEmail') as string } })} className={`w-full px-3 py-3 sm:py-2 border rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base sm:text-sm ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                        {renderError(errors.email)}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('crm.form.phone') as string}</label>
                        <input type="tel" {...register("phone")} className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base sm:text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('crm.form.address') as string}</label>
                        <input type="text" {...register("address")} className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-base sm:text-sm" />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('crm.form.communicationPreferences') as string}</label>
                    <div className="flex gap-6">
                        <label className="inline-flex items-center cursor-pointer py-2">
                            <input type="checkbox" {...register("communicationPreferences")} value="email" className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-3 sm:ml-2 text-base sm:text-sm text-gray-600 dark:text-gray-300">{t('timelineTypes.email') as string}</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer py-2">
                            <input type="checkbox" {...register("communicationPreferences")} value="sms" className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-3 sm:ml-2 text-base sm:text-sm text-gray-600 dark:text-gray-300">{t('customer.sms') as string}</span>
                        </label>
                    </div>
                </div>
            </section>

            {/* Policy Portfolio */}
            <section>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('crm.form.policies') as string}</h3>
                    <button type="button" onClick={addPolicy} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-2 rounded bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        {t('crm.form.addPolicy') as string}
                    </button>
                </div>
                
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.fieldId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-700/20 relative group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                             <button type="button" onClick={() => remove(index)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                             
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-8">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('crm.form.policyNumber') as string}</label>
                                    <input {...register(`policies.${index}.policyNumber`, { required: t('validation.policyNumberRequired') as string })} className={`w-full px-3 py-2 text-base sm:text-sm border rounded-md dark:bg-gray-700 ${errors.policies?.[index]?.policyNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} placeholder="POL-XXXX" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
                                    <select {...register(`policies.${index}.type`)} defaultValue={(field as Policy).type} className="w-full px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700">
                                        {Object.values(PolicyType).map((pt: string) => <option key={pt} value={pt}>{t(`policyTypes.${pt}`) as string}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('crm.form.insurer') as string}</label>
                                    <input {...register(`policies.${index}.insurer`)} className="w-full px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700" placeholder="Insurer Name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('crm.form.premium') as string}</label>
                                    <input type="number" {...register(`policies.${index}.premium`, { valueAsNumber: true })} className="w-full px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('crm.form.startDate') as string}</label>
                                    <input type="date" {...register(`policies.${index}.startDate`)} className="w-full px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('crm.form.endDate') as string}</label>
                                    <input type="date" {...register(`policies.${index}.endDate`)} className="w-full px-3 py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700" />
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
                {fields.length === 0 && (
                    <div className="text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-sm text-gray-500">{t('crm.form.noPolicies') as string}</p>
                        <button type="button" onClick={addPolicy} className="mt-2 text-blue-600 text-sm font-medium hover:underline">{t('crm.form.addPolicy') as string}</button>
                    </div>
                )}
            </section>

          </div>

          {/* Footer */}
          <div className="p-6 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end gap-3 flex-shrink-0 pb-8 sm:pb-6 absolute bottom-0 w-full sm:static">
            <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition text-center">
                {t('crm.cancel') as string}
            </button>
            <button type="submit" className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30 transition text-center">
                {t('crm.save') as string}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
