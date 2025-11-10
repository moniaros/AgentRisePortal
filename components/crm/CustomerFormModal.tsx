import React, { useEffect } from 'react';
import { useForm, FieldError } from 'react-hook-form';
import { useLocalization } from '../../hooks/useLocalization';
import { Customer } from '../../types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Customer) => void;
  customer: Customer | null;
  mode: 'add' | 'edit';
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ isOpen, onClose, onSubmit, customer, mode }) => {
  const { t } = useLocalization();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<Customer>({
      defaultValues: mode === 'add' ? { firstName: '', lastName: '', email: '' } : customer || {}
  });

  useEffect(() => {
    if (isOpen) {
        reset(mode === 'add' ? { firstName: '', lastName: '', email: '' } : customer || {});
    }
  }, [customer, isOpen, mode, reset]);

  if (!isOpen) return null;
  
  const renderError = (error?: FieldError) => error && <span className="text-red-500 text-xs mt-1">{error.message}</span>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">{mode === 'add' ? t('crm.addCustomer') : t('crm.editCustomer')}</h2>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">{t('crm.form.firstName')}</label>
                <input type="text" {...register("firstName", { required: (t('validation.required', {fieldName: t('crm.form.firstName')}) as string) })} className={`w-full p-2 border rounded dark:bg-gray-700 ${errors.firstName ? 'border-red-500' : 'dark:border-gray-600'}`} />
                {renderError(errors.firstName)}
              </div>
              <div>
                <label className="block text-sm font-medium">{t('crm.form.lastName')}</label>
                <input type="text" {...register("lastName", { required: (t('validation.required', {fieldName: t('crm.form.lastName')}) as string) })} className={`w-full p-2 border rounded dark:bg-gray-700 ${errors.lastName ? 'border-red-500' : 'dark:border-gray-600'}`} />
                {renderError(errors.lastName)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">{t('crm.form.email')}</label>
              <input type="email" {...register("email", { required: (t('validation.required', {fieldName: t('crm.form.email')}) as string), pattern: { value: /^\S+@\S+$/i, message: t('validation.invalidEmail') as string } })} className={`w-full p-2 border rounded dark:bg-gray-700 ${errors.email ? 'border-red-500' : 'dark:border-gray-600'}`} />
              {renderError(errors.email)}
            </div>
             <div>
                <label className="block text-sm font-medium">{t('crm.form.phone')}</label>
                <input type="tel" {...register("phone")} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            </div>
             <div>
                <label className="block text-sm font-medium">{t('crm.form.address')}</label>
                <input type="text" {...register("address")} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
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