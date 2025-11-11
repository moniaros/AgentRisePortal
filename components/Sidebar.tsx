import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { ICONS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { UserSystemRole } from '../types';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    
    // State for collapsible menus, default to open
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        overview: true,
        crm: true,
        campaigns: true,
        website: true,
        management: true,
        settings: true,
    });

    const toggleMenu = (key: string) => {
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const menuSections = [
        { 
            key: 'overview', 
            label: t('nav.overview'), 
            links: [
                { path: '/', label: t('nav.dashboard'), icon: 'dashboard' },
                { path: '/executive-dashboard', label: t('nav.executiveAnalytics'), icon: 'analytics' },
            ] 
        },
        { 
            key: 'crm', 
            label: t('nav.crm'), 
            links: [
                { path: '/micro-crm', label: t('nav.customersAndLeads'), icon: 'crm' },
                { path: '/leads-dashboard', label: t('nav.leadsDashboard'), icon: 'analytics' },
                { path: '/gap-analysis', label: t('nav.importPolicyAI'), icon: 'magic' },
            ] 
        },
        { 
            key: 'campaigns', 
            label: t('nav.campaigns'), 
            links: [
                { path: '/analytics', label: t('nav.campaignAnalytics'), icon: 'analytics' },
                { path: '/social-composer', label: t('nav.socialPosts'), icon: 'socialComposer' },
                { path: '/ad-campaigns', label: t('nav.socialAds'), icon: 'campaigns' },
            ] 
        },
        {
            key: 'website',
            label: t('nav.website'),
            links: [
                { path: '/microsite-builder', label: t('nav.micrositeBuilder'), icon: 'micrositeBuilder' },
                { path: '/news', label: t('nav.news'), icon: 'news' },
                { path: '/testimonials', label: t('nav.testimonials'), icon: 'testimonials' },
            ]
        },
        { 
            key: 'management', 
            label: t('nav.management'), 
            links: [
                { path: '/user-management', label: t('nav.userManagement'), icon: 'settings', adminOnly: true },
                { path: '/billing', label: t('nav.billing'), icon: 'billing' },
                { path: '/support', label: t('nav.support'), icon: 'support' },
            ] 
        },
        { 
            key: 'settings', 
            label: t('nav.settings'), 
            links: [
                { path: '/profile', label: t('nav.profile'), icon: 'profile' },
                { path: '/settings', label: t('nav.appSettings'), icon: 'settings' },
                { path: '/settings/automation-rules', label: t('nav.automationRules'), icon: 'automation' },
            ] 
        },
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
    
    const CollapsibleMenu: React.FC<{ section: typeof menuSections[0] }> = ({ section }) => {
        const isOpen = openMenus[section.key];
        return (
             <div className="mt-6">
                <button onClick={() => toggleMenu(section.key)} className="w-full flex justify-between items-center px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    <span>{section.label}</span>
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                {isOpen && (
                    <ul className="pl-2">
                        {section.links.map(link => {
                            // @ts-ignore
                            if (link.adminOnly && currentUser?.partyRole.roleType !== UserSystemRole.ADMIN) {
                                return null;
                            }
                            return <li key={link.path}><NavItem {...link} /></li>;
                        })}
                    </ul>
                )}
            </div>
        )
    }

    return (
        <aside className={`flex flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 overflow-hidden'} lg:w-64 lg:flex`}>
            <div className="flex items-center justify-center h-16 border-b dark:border-gray-700 flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">AgentOS</h1>
            </div>
            <nav className="flex-1 p-2 overflow-y-auto">
                {menuSections.map(section => (
                    <CollapsibleMenu key={section.key} section={section} />
                ))}
            </nav>
            <div className="p-4 border-t dark:border-gray-700">
                <NavItem path="/logout" label={t('header.logout')} icon="logout" />
            </div>
        </aside>
    );
};

export default Sidebar;