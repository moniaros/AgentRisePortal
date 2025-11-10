import React from 'react';
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

  // FIX: Use 'as const' to infer literal types for icon properties, ensuring they match 'keyof typeof ICONS'.
  const navItems = [
    { to: '/', label: t('nav.dashboard'), icon: 'dashboard' },
    { to: '/analytics', label: t('nav.analytics'), icon: 'analytics' },
    { to: '/leads-dashboard', label: t('nav.leadsDashboard'), icon: 'leadGen' },
    { to: '/lead-generation', label: t('nav.leadGen'), icon: 'leadGen' },
    { to: '/micro-crm', label: t('nav.crm'), icon: 'crm' },
    { to: '/gap-analysis', label: t('nav.gapAnalysis'), icon: 'gapAnalysis', isAi: true },
    { to: '/social-composer', label: t('nav.socialComposer'), icon: 'socialComposer', isAi: true },
    { to: '/ad-campaigns', label: t('nav.adCampaigns'), icon: 'campaigns' },
    { to: '/microsite-builder', label: t('nav.micrositeBuilder'), icon: 'micrositeBuilder' },
    { to: '/news', label: t('nav.news'), icon: 'news' },
    { to: '/testimonials', label: t('nav.testimonials'), icon: 'testimonials' },
  ] as const;

  // FIX: Use 'as const' to infer literal types for icon properties, ensuring they match 'keyof typeof ICONS'.
  const settingsNavItems = [
    { to: '/settings', label: t('nav.settings'), icon: 'settings' },
    { to: '/billing', label: t('nav.billing'), icon: 'billing' },
    { to: '/user-management', label: t('nav.userManagement'), icon: 'crm', adminOnly: true },
    { to: '/settings/automation-rules', label: t('nav.automation'), icon: 'automation', adminOnly: true },
    { to: '/logout', label: t('nav.logout'), icon: 'logout' },
  ] as const;

  const NavItem: React.FC<{ to: string, label: string | any, icon: keyof typeof ICONS, isAi?: boolean }> = ({ to, label, icon, isAi }) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center p-2 text-sm rounded-md transition-colors duration-200 ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`
      }
    >
      <span className="w-6 h-6 mr-3">{React.cloneElement(ICONS[icon], { className: "h-5 w-5" })}</span>
      <span className={`flex-1 ${!isOpen && 'hidden'}`}>{label}</span>
      {isAi && isOpen && <span className="text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">AI</span>}
    </NavLink>
  );

  return (
    <aside className={`flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-center h-16 border-b dark:border-gray-700">
        <span className={`font-bold text-xl text-blue-600 dark:text-blue-400 ${!isOpen && 'hidden'}`}>AgentOS</span>
        <span className={`font-bold text-xl text-blue-600 dark:text-blue-400 ${isOpen && 'hidden'}`}>AOS</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
      <div className="px-4 py-4 border-t dark:border-gray-700 space-y-2">
        {settingsNavItems.map(item => {
          // FIX: Check for the 'adminOnly' property's existence before accessing it, as not all items in the array have it.
          if ('adminOnly' in item && item.adminOnly && currentUser?.partyRole.roleType !== UserSystemRole.ADMIN) {
            return null;
          }
          // FIX: Destructure to remove `adminOnly` which is not a prop of NavItem. This was failing because not all items have this property.
          // By checking for the property and handling both cases, we can safely create the props for NavItem.
          if ('adminOnly' in item) {
            const { adminOnly, ...navItemProps } = item;
            return <NavItem key={item.to} {...navItemProps} />;
          }
          return <NavItem key={item.to} {...item} />;
        })}
      </div>
    </aside>
  );
};

export default Sidebar;