import React from 'react';
import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { UserSystemRole } from '../types';
import { useAuth } from '../hooks/useAuth';

const AutomationRules: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const isAdmin = currentUser?.partyRole.roleType === UserSystemRole.ADMIN;

    if (!currentUser) {
        return null; // Or a loader
    }
    
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
            isActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('automationRules.title')}</h1>
                <button
                    onClick={() => navigate('/crm/automation-rules/new')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Create New Rule
                </button>
            </div>
            
             <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <NavLink to="/crm/automation-rules" end className={navLinkClasses}>
                        {t('automationRules.overview.title')}
                    </NavLink>
                    <NavLink to="/crm/automation-rules/lead_conversion" className={navLinkClasses}>
                        {t('automationRules.categories.lead_conversion')}
                    </NavLink>
                    <NavLink to="/crm/automation-rules/communication_automation" className={navLinkClasses}>
                        {t('automationRules.categories.communication_automation')}
                    </NavLink>
                    <NavLink to="/crm/automation-rules/templates" className={navLinkClasses}>
                        {t('nav.templates')}
                    </NavLink>
                    <NavLink to="/crm/automation-rules/settings" className={navLinkClasses}>
                        {t('nav.settings')}
                    </NavLink>
                    <NavLink to="/crm/automation-rules/event-log" className={navLinkClasses}>
                        {t('nav.eventLog')}
                    </NavLink>
                </nav>
            </div>
            
            <div className="mt-4">
                <Outlet />
            </div>
        </div>
    );
};

export default AutomationRules;