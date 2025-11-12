import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth';

interface ConsentData {
  provided: boolean;
  date: string | null;
  channel: 'email' | 'sms' | 'phone' | 'web_form' | 'in_person' | 'other' | null;
}

interface ConsentManagementProps {
  gdprConsent?: ConsentData;
  marketingConsent?: ConsentData;
  onUpdateConsent: (gdprConsent: ConsentData, marketingConsent: ConsentData) => void;
  readOnly?: boolean;
}

const ConsentManagement: React.FC<ConsentManagementProps> = ({
  gdprConsent,
  marketingConsent,
  onUpdateConsent,
  readOnly = false
}) => {
  const { t } = useLocalization();
  const { currentUser } = useAuth();

  // Initialize state with default values
  const [gdpr, setGdpr] = useState<ConsentData>(
    gdprConsent || { provided: false, date: null, channel: null }
  );
  const [marketing, setMarketing] = useState<ConsentData>(
    marketingConsent || { provided: false, date: null, channel: null }
  );
  const [isEditing, setIsEditing] = useState(false);

  // Check if consent is older than 6 months
  const isConsentExpired = (consentDate: string | null): boolean => {
    if (!consentDate) return false;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(consentDate) < sixMonthsAgo;
  };

  const handleSave = () => {
    // If consent is newly provided and no date is set, set current date
    if (gdpr.provided && !gdpr.date) {
      gdpr.date = new Date().toISOString();
    }
    if (marketing.provided && !marketing.date) {
      marketing.date = new Date().toISOString();
    }

    onUpdateConsent(gdpr, marketing);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setGdpr(gdprConsent || { provided: false, date: null, channel: null });
    setMarketing(marketingConsent || { provided: false, date: null, channel: null });
    setIsEditing(false);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatChannel = (channel: string | null): string => {
    if (!channel) return 'N/A';
    return channel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const canEdit = !readOnly && (currentUser?.partyRole.roleType === 'admin' || currentUser?.partyRole.roleType === 'agent');

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          GDPR & Marketing Consent
        </h2>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
          >
            {t('common.edit') as string}
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* GDPR Consent */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="gdpr-consent"
                  checked={gdpr.provided}
                  onChange={(e) => {
                    if (isEditing) {
                      setGdpr({
                        ...gdpr,
                        provided: e.target.checked,
                        date: e.target.checked && !gdpr.date ? new Date().toISOString() : gdpr.date
                      });
                    }
                  }}
                  disabled={!isEditing}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <label htmlFor="gdpr-consent" className="text-lg font-medium text-gray-900 dark:text-white">
                  GDPR Consent Provided
                </label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-8">
                Consent for processing personal data according to GDPR regulations
              </p>
            </div>
            {gdpr.provided && isConsentExpired(gdpr.date) && (
              <div className="ml-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  ⚠️ Expired
                </span>
              </div>
            )}
          </div>

          {gdpr.provided && (
            <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Granted
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={gdpr.date ? new Date(gdpr.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setGdpr({ ...gdpr, date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(gdpr.date)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Acquisition Channel
                </label>
                {isEditing ? (
                  <select
                    value={gdpr.channel || ''}
                    onChange={(e) => setGdpr({ ...gdpr, channel: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">Select Channel</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="phone">Phone</option>
                    <option value="web_form">Web Form</option>
                    <option value="in_person">In Person</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">{formatChannel(gdpr.channel)}</p>
                )}
              </div>
            </div>
          )}

          {gdpr.provided && isConsentExpired(gdpr.date) && (
            <div className="ml-8 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ Warning:</strong> This consent was granted more than 6 months ago and may be considered outdated.
                Please verify and update consent status with the customer.
              </p>
            </div>
          )}
        </div>

        {/* Marketing Consent */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="marketing-consent"
                  checked={marketing.provided}
                  onChange={(e) => {
                    if (isEditing) {
                      setMarketing({
                        ...marketing,
                        provided: e.target.checked,
                        date: e.target.checked && !marketing.date ? new Date().toISOString() : marketing.date
                      });
                    }
                  }}
                  disabled={!isEditing}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <label htmlFor="marketing-consent" className="text-lg font-medium text-gray-900 dark:text-white">
                  Marketing Consent Provided
                </label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-8">
                Consent for receiving marketing communications and promotional materials
              </p>
            </div>
            {marketing.provided && isConsentExpired(marketing.date) && (
              <div className="ml-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  ⚠️ Expired
                </span>
              </div>
            )}
          </div>

          {marketing.provided && (
            <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Granted
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={marketing.date ? new Date(marketing.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setMarketing({ ...marketing, date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(marketing.date)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Acquisition Channel
                </label>
                {isEditing ? (
                  <select
                    value={marketing.channel || ''}
                    onChange={(e) => setMarketing({ ...marketing, channel: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">Select Channel</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="phone">Phone</option>
                    <option value="web_form">Web Form</option>
                    <option value="in_person">In Person</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-sm text-gray-900 dark:text-white">{formatChannel(marketing.channel)}</p>
                )}
              </div>
            </div>
          )}

          {marketing.provided && isConsentExpired(marketing.date) && (
            <div className="ml-8 mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ Warning:</strong> This consent was granted more than 6 months ago and may be considered outdated.
                Please verify and update consent status with the customer.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition text-sm"
          >
            {t('common.cancel') as string}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
          >
            {t('common.save') as string}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsentManagement;
