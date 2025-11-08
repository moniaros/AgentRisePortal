import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

interface AddressChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onSubmit: (newAddress: string) => void;
}

const AddressChangeModal: React.FC<AddressChangeModalProps> = ({ isOpen, onClose, currentAddress, onSubmit }) => {
  const { t } = useLocalization();
  const [address, setAddress] = useState(currentAddress);

  useEffect(() => {
    setAddress(currentAddress);
  }, [currentAddress, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(address);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">{t('customer.changeAddressTitle')}</h2>
          </div>
          <div className="p-6">
            <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('crm.form.address')}
            </label>
            <input
              id="address-input"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
              {t('crm.cancel')}
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {t('crm.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressChangeModal;