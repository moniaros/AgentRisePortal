import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { ICONS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { UserSystemRole } from '../types';
import { useInquiriesData } from '../hooks/useInquiriesData';
import { useTasks } from '../hooks/useTasks';
import { getAvatarDataUri } from '../lib/avatars';

interface SidebarProps {
    isOpen: boolean;
}

interface SidebarLinkItem {
    path: string;
    label: any;
    icon: string;
    adminOnly?: boolean;
    badgeCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const { inquiries } = useInquiriesData();
    const { tasks } = useTasks();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        dashboard: true,
        growth: true,
        clients: true,
        marketing: false,
        intelligence: false,
        operations: false,
    });

    const toggleMenu = (key: string) => {
        setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const openTasksCount = useMemo(
        () => tasks.filter((task) => !task.isCompleted).length,
        [tasks]
    );
    const inboxCount = inquiries?.length || 0;

    const menuSections: { key: string; label: any; links: SidebarLinkItem[] }[] = [
        {
            key: 'dashboard',
            label: t('nav.dashboard'),
            links: [
                { path: '/', label: t('nav.overview'), icon: 'dashboard' },
                { path: '/pipeline/my-day', label: t('nav.myDay'), icon: 'tasks' },
                {
                    path: '/tasks',
                    label: t('nav.tasks'),
                    icon: 'tasks',
                    badgeCount: openTasksCount,
                },
            ],
        },
        {
            key: 'growth',
            label: t('nav.growth'),
            links: [
                { path: '/pipeline/board', label: t('nav.opportunityPipeline'), icon: 'pipeline' },
                {
                    path: '/pipeline/inbox',
                    label: t('nav.leadsInbox'),
                    icon: 'leadGen',
                    badgeCount: inboxCount,
                },
                { path: '/opportunities-hub', label: t('nav.opportunitiesHub'), icon: 'magic' },
            ],
        },
        {
            key: 'clients',
            label: t('nav.bookOfBusiness'),
            links: [
                { path: '/micro-crm', label: t('nav.customers'), icon: 'crm' },
                { path: '/gap-analysis', label: t('nav.policyIntelligence'), icon: 'magic' },
                { path: '/client-wallet', label: 'Client Wallet & FNOL', icon: 'crm' },
            ],
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
            ],
        },
        {
            key: 'intelligence',
            label: t('nav.intelligence'),
            links: [
                {
                    path: '/executive-dashboard',
                    label: t('nav.executiveAnalytics'),
                    icon: 'analytics',
                },
                { path: '/analytics', label: t('nav.campaignAnalytics'), icon: 'analytics' },
                { path: '/leads-dashboard', label: t('nav.leadsDashboard'), icon: 'analytics' },
            ],
        },
        {
            key: 'operations',
            label: t('nav.operations'),
            links: [
                {
                    path: '/crm/automation-rules',
                    label: t('nav.automation'),
                    icon: 'automation',
                    adminOnly: true,
                },
                {
                    path: '/user-management',
                    label: t('nav.userManagement'),
                    icon: 'settings',
                    adminOnly: true,
                },
                { path: '/billing', label: t('nav.billing'), icon: 'billing' },
                { path: '/support', label: t('nav.support'), icon: 'support' },
                { path: '/settings', label: t('nav.appSettings'), icon: 'settings' },
            ],
        },
    ];

    const NavItem: React.FC<SidebarLinkItem> = ({ path, label, icon, badgeCount }) => (
        <NavLink
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 ring-1 ring-blue-200/70 dark:ring-blue-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
            }
        >
            <span className="flex items-center min-w-0">
                {React.cloneElement(ICONS[icon as keyof typeof ICONS] || ICONS['dashboard'], {
                    className:
                        'h-4 w-4 mr-3 flex-shrink-0 transition-colors opacity-75 group-hover:opacity-100',
                })}
                <span className="truncate">{label}</span>
            </span>
            {typeof badgeCount === 'number' && badgeCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[11px] font-semibold rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 tabular-nums">
                    {badgeCount}
                </span>
            )}
        </NavLink>
    );

    const fullName = currentUser
        ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`
        : 'Advisor';
    const avatarSrc =
        currentUser?.party.profilePhotoUrl || getAvatarDataUri(fullName, '#0f766e');

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 lg:static lg:translate-x-0 lg:flex-shrink-0 h-full ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className="flex items-center px-5 h-16 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                            />
                        </svg>
                    </div>
                    <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                        AgentOS
                    </span>
                </div>
            </div>

            <nav className="flex-1 px-3.5 py-5 overflow-y-auto">
                {menuSections.map((section) => {
                    const visibleLinks = section.links.filter(
                        (link) =>
                            !link.adminOnly ||
                            currentUser?.partyRole.roleType === UserSystemRole.ADMIN
                    );
                    if (visibleLinks.length === 0) return null;
                    const menuOpen = openMenus[section.key];

                    return (
                        <div key={section.key} className="mb-4">
                            <button
                                onClick={() => toggleMenu(section.key)}
                                className="w-full flex justify-between items-center px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none"
                            >
                                <span>{section.label}</span>
                                <svg
                                    className={`w-3 h-3 transition-transform duration-150 ${
                                        menuOpen ? 'rotate-90' : ''
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                            {menuOpen && (
                                <ul className="mt-1 space-y-0.5">
                                    {visibleLinks.map((link) => (
                                        <li key={link.path}>
                                            <NavItem {...link} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900">
                <NavLink
                    to="/profile"
                    className="flex items-center p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                    <img
                        src={avatarSrc}
                        alt="Profile"
                        className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex-1 min-w-0 ml-3">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {fullName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {currentUser?.partyRole.roleTitle}
                        </p>
                    </div>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;