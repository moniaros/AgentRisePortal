import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { UserRole } from '../../types';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (name: string, email: string, role: UserRole) => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onInvite }) => {
  const { t } = useLocalization();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // FIX: Explicitly type the state with UserRole enum to match the onInvite handler's expectation.
  const [role, setRole] = useState<UserRole>(UserRole.AGENT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(name, email, role);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">{t('userManagement.inviteModalTitle')}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">{t('crm.name')}</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">{t('crm.form.email')}</label>
              <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium">{t('userManagement.role')}</label>
              <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                <option value="agent">{t('userManagement.agent')}</option>
                <option value="admin">{t('userManagement.admin')}</option>
              </select>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('crm.cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('userManagement.sendInvite')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;