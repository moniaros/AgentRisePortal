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
        dashboard: true,
        growth: true,
        clients: true,
        marketing: false,
        intelligence: false,
        operations: false,
    });

    const toggleMenu = (key: string) => {
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Enterprise Level Categorization
    const menuSections = [
        { 
            key: 'dashboard', 
            label: t('nav.dashboard'), 
            links: [
                { path: '/', label: t('nav.overview'), icon: 'dashboard' },
                { path: '/pipeline/my-day', label: t('nav.myDay'), icon: 'tasks' },
                { path: '/tasks', label: t('nav.tasks'), icon: 'tasks' },
            ] 
        },
        {
            key: 'growth',
            label: t('nav.growth'),
            links: [
                { path: '/pipeline/board', label: t('nav.opportunityPipeline'), icon: 'pipeline' },
                { path: '/pipeline/inbox', label: t('nav.leadsInbox'), icon: 'leadGen' },
                { path: '/opportunities-hub', label: t('nav.opportunitiesHub'), icon: 'magic' },
            ]
        },
        { 
            key: 'clients', 
            label: t('nav.bookOfBusiness'), 
            links: [
                { path: '/micro-crm', label: t('nav.customers'), icon: 'crm' },
                { path: '/gap-analysis', label: t('nav.policyIntelligence'), icon: 'magic' },
            ] 
        },
        { 
            key: 'marketing', 
            label: t('nav.marketingHub'), 
            links: [
                { path: '/social-composer', label: t('nav.socialPosts'), icon: 'socialComposer' },
                { path: '/ad-campaigns', label: t('nav.socialAds'), icon: 'campaigns' },
                { path: '/microsite-builder', label: t('nav.website'), icon: 'micrositeBuilder' },
                { path: '/news', label: t('nav.news'), icon: 'news' },
                { path: '/testimonials', label: t('nav.testimonials'), icon: 'testimonials' },
            ] 
        },
        {
            key: 'intelligence',
            label: t('nav.intelligence'),
            links: [
                { path: '/executive-dashboard', label: t('nav.executiveAnalytics'), icon: 'analytics' },
                { path: '/analytics', label: t('nav.campaignAnalytics'), icon: 'analytics' },
                { path: '/leads-dashboard', label: t('nav.leadsDashboard'), icon: 'analytics' },
            ]
        },
        { 
            key: 'operations', 
            label: t('nav.operations'), 
            links: [
                { path: '/crm/automation-rules', label: t('nav.automation'), icon: 'automation', adminOnly: true },
                { path: '/user-management', label: t('nav.userManagement'), icon: 'settings', adminOnly: true },
                { path: '/billing', label: t('nav.billing'), icon: 'billing' },
                { path: '/support', label: t('nav.support'), icon: 'support' },
                { path: '/settings', label: t('nav.appSettings'), icon: 'settings' },
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
            {React.cloneElement(ICONS[icon as keyof typeof ICONS] || ICONS['dashboard'], { className: "h-5 w-5 mr-3" })}
            <span className="text-sm font-medium">{label}</span>
        </NavLink>
    );
    
    const CollapsibleMenu: React.FC<{ section: typeof menuSections[0] }> = ({ section }) => {
        const isOpen = openMenus[section.key];
        return (
             <div className="mt-4">
                <button onClick={() => toggleMenu(section.key)} className="w-full flex justify-between items-center px-2 py-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <span>{section.label}</span>
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                {isOpen && (
                    <ul className="pl-2 border-l border-gray-200 dark:border-gray-700 ml-2">
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
        <aside className={`flex flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 overflow-hidden'} lg:w-64 lg:flex z-20 h-full`}>
            <div className="flex items-center px-6 h-16 border-b dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span className="text-xl font-bold tracking-tight">AgentOS</span>
                </div>
            </div>
            <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin">
                {menuSections.map(section => (
                    <CollapsibleMenu key={section.key} section={section} />
                ))}
            </nav>
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                 <NavLink
                    to="/profile"
                    className="flex items-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                        {currentUser?.party.partyName.firstName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {currentUser?.party.partyName.firstName} {currentUser?.party.partyName.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            View Profile
                        </p>
                    </div>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;