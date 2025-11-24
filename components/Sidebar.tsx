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
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
            }
        >
            {React.cloneElement(ICONS[icon as keyof typeof ICONS] || ICONS['dashboard'], { 
                className: "h-5 w-5 mr-3 flex-shrink-0 transition-colors opacity-70 group-hover:opacity-100" 
            })}
            <span className="truncate">{label}</span>
        </NavLink>
    );
    
    const CollapsibleMenu: React.FC<{ section: typeof menuSections[0] }> = ({ section }) => {
        const isOpen = openMenus[section.key];
        return (
             <div className="mb-4">
                <button 
                    onClick={() => toggleMenu(section.key)} 
                    className="w-full flex justify-between items-center px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-800 dark:hover:text-slate-200 transition-colors focus:outline-none"
                >
                    <span>{section.label}</span>
                    <svg className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ul className="mt-1 space-y-1 pl-2 border-l-2 border-slate-100 dark:border-slate-700 ml-3">
                        {section.links.map(link => {
                            // @ts-ignore
                            if (link.adminOnly && currentUser?.partyRole.roleType !== UserSystemRole.ADMIN) {
                                return null;
                            }
                            return <li key={link.path}><NavItem {...link} /></li>;
                        })}
                    </ul>
                </div>
            </div>
        )
    }

    return (
        <aside className={`flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${isOpen ? 'w-72' : 'w-0 overflow-hidden'} lg:w-72 lg:flex z-20 h-full shadow-xl lg:shadow-none`}>
            {/* Header / Brand */}
            <div className="flex items-center px-6 h-16 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-slate-900 transition-colors duration-200">
                <div className="flex items-center gap-2.5 text-blue-700 dark:text-blue-500">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                        </svg>
                    </div>
                    <span className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">AgentOS</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {menuSections.map(section => (
                    <CollapsibleMenu key={section.key} section={section} />
                ))}
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 transition-colors duration-200">
                 <NavLink
                    to="/profile"
                    className="flex items-center p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-slate-600 group"
                >
                    <div className="relative">
                        <img 
                            src={currentUser?.party.profilePhotoUrl || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} 
                            alt="Profile" 
                            className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-slate-600 group-hover:border-blue-400 transition-colors" 
                        />
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-slate-800" />
                    </div>
                    <div className="flex-1 min-w-0 ml-3">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {currentUser?.party.partyName.firstName} {currentUser?.party.partyName.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {currentUser?.partyRole.roleTitle}
                        </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;