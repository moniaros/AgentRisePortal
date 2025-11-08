import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { ICONS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const { t } = useLocalization();

    const navItems = [
        { path: '/', label: 'nav.dashboard', icon: ICONS.dashboard },
        { path: '/lead-generation', label: 'nav.leadGen', icon: ICONS.leadGen },
        { path: '/micro-crm', label: 'nav.microCrm', icon: ICONS.microCrm },
        { path: '/microsite-builder', label: 'nav.micrositeBuilder', icon: ICONS.micrositeBuilder },
        { path: '/gap-analysis', label: 'nav.gapAnalysis', icon: ICONS.gapAnalysis },
        { path: '/onboarding', label: 'nav.onboarding', icon: ICONS.onboarding },
        { path: '/billing', label: 'nav.billing', icon: ICONS.billing },
    ];
    
    const baseLinkClass = "flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700";
    const activeLinkClass = "bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-white";
    const inactiveLinkClass = "text-gray-900 dark:text-white";

  return (
    <aside className={`z-30 flex-shrink-0 w-64 overflow-y-auto bg-white dark:bg-gray-800 ${isOpen ? 'block' : 'hidden'} lg:block`}>
      <div className="py-4 text-gray-500 dark:text-gray-400">
        <a className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200" href="#">
          Agent CRM
        </a>
        <ul className="mt-6">
          {navItems.map(item => (
            <li className="relative px-6 py-3" key={item.path}>
                <NavLink 
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                >
                    {React.cloneElement(item.icon, { className: "w-6 h-6" })}
                    <span className="ml-4">{t(item.label)}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
