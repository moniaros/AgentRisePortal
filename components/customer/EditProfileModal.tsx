import React, { useEffect } from 'react';
import { useForm, FieldError } from 'react-hook-form';
import { useLocalization } from '../../hooks/useLocalization';
import { Customer } from '../../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customer: Customer) => void;
  customer: Customer;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSubmit, customer }) => {
  const { t } = useLocalization();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Customer>({
    defaultValues: customer,
  });

  useEffect(() => {
    if (isOpen) {
      reset(customer);
    }
  }, [customer, isOpen, reset]);

  if (!isOpen) return null;

  // FIX: Broaden the error type to 'any' to handle complex error objects from react-hook-form.
  const renderError = (error: any) => error?.message ? <span className="text-red-500 text-xs mt-1">{error.message as string}</span> : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">{t('customer.editProfile') as string}</h2>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">{t('crm.form.firstName') as string}</label>
                <input type="text" {...register("firstName", { required: (t('validation.required') as string).replace('{fieldName}', t('crm.form.firstName') as string) })} className={`w-full p-2 border rounded dark:bg-gray-700 ${errors.firstName ? 'border-red-500' : 'dark:border-gray-600'}`} />
                {renderError(errors.firstName)}
              </div>
              <div>
                <label className="block text-sm font-medium">{t('crm.form.lastName') as string}</label>
                <input type="text" {...register("lastName", { required: (t('validation.required') as string).replace('{fieldName}', t('crm.form.lastName') as string) })} className={`w-full p-2 border rounded dark:bg-gray-700 ${errors.lastName ? 'border-red-500' : 'dark:border-gray-600'}`} />
                {renderError(errors.lastName)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">{t('crm.form.email') as string}</label>
              <input type="email" {...register("email", { required: (t('validation.required') as string).replace('{fieldName}', t('crm.form.email') as string), pattern: { value: /^\S+@\S+$/i, message: t('validation.invalidEmail') as string } })} className={`w-full p-2 border rounded dark:bg-gray-700 ${errors.email ? 'border-red-500' : 'dark:border-gray-600'}`} />
              {renderError(errors.email)}
            </div>
            <div>
                <label className="block text-sm font-medium">{t('crm.form.phone') as string}</label>
                <input type="tel" {...register("phone")} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            </div>
             <div>
                <label className="block text-sm font-medium">{t('crm.form.dob') as string}</label>
                <input type="date" {...register("dateOfBirth")} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('crm.form.communicationPreferences') as string}</label>
                <div className="mt-2 flex gap-4">
                    <label className="flex items-center">
                        <input type="checkbox" {...register("communicationPreferences")} value="email" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm">{t('timelineTypes.email') as string}</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" {...register("communicationPreferences")} value="sms" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-2 text-sm">{t('customer.sms') as string}</span>
                    </label>
                </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('crm.cancel') as string}</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('crm.save') as string}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;