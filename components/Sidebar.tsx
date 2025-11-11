import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { ICONS } from '../constants';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const { t } = useLocalization();
    const [isCrmOpen, setIsCrmOpen] = useState(true);

    const overviewLinks = [
        { path: '/', label: t('nav.dashboard'), icon: 'dashboard' },
        { path: '/executive-dashboard', label: t('nav.executiveAnalytics'), icon: 'analytics' },
    ];
    
    const crmLinks = [
        { path: '/micro-crm', label: t('nav.customersAndLeads'), icon: 'crm' },
        { path: '/gap-analysis', label: t('nav.importPolicyAI'), icon: 'magic' },
    ];

    const navLinks = [
        { path: '/leads-dashboard', label: t('nav.leadsDashboard'), icon: 'analytics' },
        { path: '/social-composer', label: t('nav.socialComposer'), icon: 'socialComposer' },
        { path: '/ad-campaigns', label: t('nav.adCampaigns'), icon: 'campaigns' },
        { path: '/analytics', label: t('nav.analytics'), icon: 'analytics' },
        { path: '/microsite-builder', label: t('nav.micrositeBuilder'), icon: 'micrositeBuilder' },
        { path: '/news', label: t('nav.news'), icon: 'news' },
        { path: '/testimonials', label: t('nav.testimonials'), icon: 'testimonials' },
    ];

    const managementLinks = [
        { path: '/user-management', label: t('nav.userManagement'), icon: 'settings' },
        { path: '/billing', label: t('nav.billing'), icon: 'billing' },
    ];

    const NavItem: React.FC<{ path: string, label: any, icon: string }> = ({ path, label, icon }) => (
        <NavLink
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
                `flex items-center p-2 my-1 rounded-md transition-colors ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`
            }
        >
            {React.cloneElement(ICONS[icon as keyof typeof ICONS], { className: "h-5 w-5 mr-3" })}
            <span className="text-sm font-medium">{label}</span>
        </NavLink>
    );

    return (
        <aside className={`flex flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 overflow-hidden'} lg:w-64 lg:flex`}>
            <div className="flex items-center justify-center h-16 border-b dark:border-gray-700 flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">AgentOS</h1>
            </div>
            <nav className="flex-1 p-4 overflow-y-auto">
                <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('nav.overview')}</h2>
                <ul>
                    {overviewLinks.map(link => <li key={link.path}><NavItem {...link} /></li>)}
                </ul>
                
                <div className="mt-6">
                    <button onClick={() => setIsCrmOpen(!isCrmOpen)} className="w-full flex justify-between items-center px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        <span>{t('nav.crm')}</span>
                        <svg className={`w-4 h-4 transition-transform ${isCrmOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    {isCrmOpen && (
                        <ul className="pl-2">
                            {crmLinks.map(link => <li key={link.path}><NavItem {...link} /></li>)}
                        </ul>
                    )}
                </div>

                <h2 className="px-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</h2>
                <ul>
                    {navLinks.map(link => <li key={link.path}><NavItem {...link} /></li>)}
                </ul>

                <h2 className="px-2 mt-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Management</h2>
                 <ul>
                    {managementLinks.map(link => <li key={link.path}><NavItem {...link} /></li>)}
                </ul>
            </nav>
            <div className="p-4 border-t dark:border-gray-700">
                <NavItem path="/logout" label={t('header.logout')} icon="logout" />
            </div>
        </aside>
    );
};

export default Sidebar;