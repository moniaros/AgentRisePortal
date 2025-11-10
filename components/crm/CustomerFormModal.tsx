import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '', policies: [], agencyId: '', communicationPreferences: []
};

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSubmit, customer, mode }) => {
  const { t } = useLocalization();
  
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<Customer>({
    defaultValues: customer || emptyCustomer
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "policies"
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

  const renderError = (message: string | undefined) => message ? <span className="text-red-500 text-xs mt-1">{message}</span> : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">{t(mode === 'add' ? 'crm.addCustomer' : 'crm.editCustomer')}</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input type="text" {...register("firstName", { required: t('validation.required').replace('{fieldName}', t('crm.form.firstName')) })} placeholder={t('crm.form.firstName')} className={`w-full p-2 border rounded dark:bg-gray-700 ${errors.firstName ? 'border-red-500' : 'dark:border-gray-600'}`} />
                {renderError(errors.firstName?.message)}
              </div>
              <div>
                <input type="text" {...register("lastName", { required: t('validation.required').replace('{fieldName}', t('crm.form.lastName')) })} placeholder={t('crm.form.lastName')} className={`w-full p-2 border rounded dark:bg-gray-700 ${errors.lastName ? 'border-red-500' : 'dark:border-gray-600'}`} />
                {renderError(errors.lastName?.message)}
              </div>
            </div>
            <div>
              <input type="email" {...register("email", { required: t('validation.required').replace('{fieldName}', t('crm.form.email')), pattern: { value: /^\S+@\S+$/i, message: t('validation.invalidEmail') } })} placeholder={t('crm.form.email')} className={`w-full p-2 border rounded dark:bg-gray-700 ${errors.email ? 'border-red-500' : 'dark:border-gray-600'}`} />
              {renderError(errors.email?.message)}
            </div>
            <input type="tel" {...register("phone")} placeholder={t('crm.form.phone')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <input type="text" {...register("address")} placeholder={t('crm.form.address')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            <input type="date" {...register("dateOfBirth")} placeholder={t('crm.form.dob')} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('crm.form.communicationPreferences')}</label>
                <div className="mt-2 flex gap-4">
                    <label className="flex items-center">
                        <input type="checkbox" {...register("communicationPreferences")} value="email" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm">{t('timelineTypes.email')}</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" {...register("communicationPreferences")} value="sms" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm">{t('customer.sms')}</span>
                    </label>
                </div>
            </div>

            <div className="pt-4">
                <h3 className="text-lg font-semibold mb-2">{t('crm.form.policies')}</h3>
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-3 border rounded-md dark:border-gray-600 space-y-2 relative">
                             <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <input {...register(`policies.${index}.policyNumber`, { required: t('validation.policyNumberRequired') })} placeholder={t('crm.form.policyNumber')} className={`w-full p-2 border rounded dark:bg-gray-700 ${errors.policies?.[index]?.policyNumber ? 'border-red-500' : 'dark:border-gray-600'}`} />
                                    {renderError(errors.policies?.[index]?.policyNumber?.message)}
                                </div>
                                <select {...register(`policies.${index}.type`)} defaultValue={field.type} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    {Object.values(PolicyType).map((pt: string) => <option key={pt} value={pt}>{t(`policyTypes.${pt}`)}</option>)}
                                </select>
                                <input {...register(`policies.${index}.insurer`)} placeholder={t('crm.form.insurer')} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="number" {...register(`policies.${index}.premium`, { valueAsNumber: true })} placeholder={t('crm.form.premium')} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="date" {...register(`policies.${index}.startDate`)} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <input type="date" {...register(`policies.${index}.endDate`)} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                                <select {...register(`policies.${index}.isActive`, {setValueAs: v => v === 'true'})} defaultValue={String(field.isActive)} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                                    <option value="true">{t('statusLabels.active')}</option>
                                    <option value="false">{t('statusLabels.inactive')}</option>
                                </select>
                             </div>
                        </div>
                    ))}
                </div>
                {fields.length === 0 && <p className="text-sm text-gray-500">{t('crm.form.noPolicies')}</p>}
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