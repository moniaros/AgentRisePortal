
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types';
import { ICONS } from '../constants';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { language, setLanguage, t } = useLocalization();
  const isOnline = useOnlineStatus();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="text-gray-500 focus:outline-none lg:hidden">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="relative mx-4 lg:mx-0">
          <span className={`flex items-center gap-2 px-3 py-1 text-sm rounded-full ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isOnline ? ICONS.online : ICONS.offline}
            {isOnline ? t('header.online') : t('header.offline')}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Language Switcher */}
        <div className="relative">
          <button onClick={() => setLanguage(language === Language.EN ? Language.EL : Language.EN)} className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-semibold uppercase">
            {language}
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative z-10 block h-10 w-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500">
            <img className="h-full w-full object-cover" src="https://picsum.photos/100/100" alt="Your avatar" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow-xl z-10">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t('header.welcome')}, Alex</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t('header.profile')}</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t('header.settings')}</a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">{t('header.logout')}</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
