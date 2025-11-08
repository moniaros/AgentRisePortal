import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { NAV_LINKS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { t } = useLocalization();
  const sidebarClasses = `
    z-30 inset-y-0 left-0 w-64
    bg-gray-900 dark:bg-gray-900 text-white
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0
  `;
  const linkBaseClasses = "flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200";
  const linkActiveClasses = "bg-gray-700 text-white";

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-center mt-8">
        <div className="flex items-center">
            <svg className="w-8 h-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span className="text-white text-2xl mx-2 font-semibold">{t('nav.brand')}</span>
        </div>
      </div>
      <nav className="mt-10">
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `${linkBaseClasses} ${isActive ? linkActiveClasses : ''}`}
          >
            {link.icon}
            <span className="mx-4">{t(`nav.${link.labelKey}`)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
