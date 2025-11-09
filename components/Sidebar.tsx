import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { ICONS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { t } = useLocalization();

  const navItems = [
    { to: '/', text: t('nav.dashboard'), icon: ICONS.dashboard },
    { to: '/lead-generation', text: t('nav.leadGen'), icon: ICONS.leadGen },
    { to: '/micro-crm', text: t('nav.crm'), icon: ICONS.crm },
    { to: '/microsite-builder', text: t('nav.micrositeBuilder'), icon: ICONS.micrositeBuilder },
    { to: '/gap-analysis', text: t('nav.gapAnalysis'), icon: ICONS.gapAnalysis },
    { to: '/onboarding', text: t('nav.onboarding'), icon: ICONS.onboarding },
    { to: '/billing', text: t('nav.billing'), icon: ICONS.billing },
  ];

  const NavItem: React.FC<{ to: string; text: string; icon: React.ReactElement }> = ({ to, text, icon }) => (
    <li>
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `flex items-center p-2 text-base font-normal rounded-lg transition duration-75 group ${
            isActive
              ? 'bg-blue-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`
        }
      >
        {React.cloneElement(icon, { className: "w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" })}
        <span className="ml-3">{text}</span>
      </NavLink>
    </li>
  );

  return (
    <aside
      className={`z-30 flex-shrink-0 w-64 overflow-y-auto bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out ${
        isOpen ? 'block' : 'hidden'
      } lg:block`}
    >
      <div className="py-4 text-gray-500 dark:text-gray-400">
        <Link to="/" className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200">
          AgentOS
        </Link>
        <ul className="mt-6 space-y-2 px-2">
          {navItems.map(item => <NavItem key={item.to} {...item} />)}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;