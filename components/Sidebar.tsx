
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { t } = useLocalization();

  const navItems = [
    { path: '/', label: t('nav.dashboard') },
    { path: '/lead-generation', label: t('nav.leadGen') },
    { path: '/micro-crm', label: t('nav.crm') },
    { path: '/gap-analysis', label: t('nav.gapAnalysis') },
    { path: '/social-composer', label: t('nav.socialComposer') },
    { path: '/ad-campaigns', label: t('nav.adCampaigns') },
    { path: '/analytics', label: t('nav.analytics') },
    { type: 'divider' },
    { path: '/onboarding', label: t('nav.onboarding') },
    { path: '/billing', label: t('nav.billing') },
    { path: '/microsite-builder', label: t('nav.micrositeBuilder') },
  ];

  const baseLinkClass = "flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700";
  const activeLinkClass = "bg-blue-500 text-white dark:bg-blue-600";

  return (
    <aside className={`relative bg-white dark:bg-gray-800 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'} overflow-hidden lg:w-64 lg:block flex-shrink-0`}>
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 border-b dark:border-gray-700">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">AgentOS</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item, index) =>
                    item.type === 'divider' ? (
                        <hr key={`divider-${index}`} className="my-4 border-gray-200 dark:border-gray-700" />
                    ) : (
                        <NavLink
                            key={item.path}
                            to={item.path!}
                            className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}
                            end={item.path === '/'}
                        >
                            <span className="mx-4">{item.label}</span>
                        </NavLink>
                    )
                )}
            </nav>
        </div>
    </aside>
  );
};

export default Sidebar;
