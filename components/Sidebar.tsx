import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { t } = useLocalization();

  const navItems = [
    { path: '/', label: 'nav.dashboard', icon: 'dashboard' },
    { path: '/leads-dashboard', label: 'nav.leadsDashboard', icon: 'leadGen' },
    { path: '/lead-generation', label: 'nav.leadGen', icon: 'leadGen' },
    { path: '/micro-crm', label: 'nav.crm', icon: 'crm' },
    { path: '/gap-analysis', label: 'nav.gapAnalysis', icon: 'gapAnalysis' },
    { path: '/onboarding', label: 'nav.onboarding', icon: 'onboarding' },
    { path: '/billing', label: 'nav.billing', icon: 'billing' },
  ];

  const toolsItems = [
    { path: '/microsite-builder', label: 'nav.micrositeBuilder', icon: 'micrositeBuilder' },
    { path: '/social-composer', label: 'nav.socialComposer', icon: 'socialComposer' },
    { path: '/campaigns', label: 'nav.adCampaigns', icon: 'campaigns' },
    { path: '/analytics', label: 'nav.analytics', icon: 'analytics' },
  ];
  
  const settingsItems = [
      { path: '/user-management', label: 'nav.userManagement', icon: 'settings' },
      { path: '/settings', label: 'nav.settings', icon: 'settings' },
      { path: '/logout', label: 'nav.logout', icon: 'logout' },
  ];

  const renderNavLink = (item: { path: string; label: string; icon: string; }) => (
    <li key={item.path}>
      <NavLink
        to={item.path}
        end={item.path === '/'}
        className={({ isActive }) =>
          `flex items-center p-2 text-base font-normal rounded-lg transition-colors duration-150 ${
            isActive
              ? 'bg-blue-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`
        }
      >
        {React.cloneElement(ICONS[item.icon], { className: "w-6 h-6" })}
        <span className="ml-3">{t(item.label)}</span>
      </NavLink>
    </li>
  );

  return (
    <aside className={`z-30 flex-shrink-0 w-64 h-full bg-white dark:bg-gray-800 lg:block transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b dark:border-gray-700">
          <a href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            AgentOS
          </a>
        </div>
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div>
            <h3 className="px-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">{t('nav.sections.main')}</h3>
            <ul className="mt-2 space-y-1">
              {navItems.map(renderNavLink)}
            </ul>
          </div>
          <div>
            <h3 className="px-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">{t('nav.sections.tools')}</h3>
            <ul className="mt-2 space-y-1">
              {toolsItems.map(renderNavLink)}
            </ul>
          </div>
           <div>
            <h3 className="px-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">{t('nav.sections.account')}</h3>
            <ul className="mt-2 space-y-1">
              {settingsItems.map(renderNavLink)}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
