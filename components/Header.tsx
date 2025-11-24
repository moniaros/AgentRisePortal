import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useClickOutside } from '../hooks/useClickOutside';
// FIX: Correct import path
import { Language } from '../types';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { language, setLanguage, t } = useLocalization();
  const isOnline = useOnlineStatus();
  const { currentUser } = useAuth();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileMenuRef, () => setProfileMenuOpen(false));

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };
  
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 transition-colors duration-200">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="text-gray-500 dark:text-gray-400 focus:outline-none lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="relative text-gray-600 dark:text-gray-300 ml-4 hidden sm:block">
          <input
            type="search"
            name="search"
            placeholder={t('header.search')}
            className="bg-gray-100 dark:bg-gray-700 h-10 px-5 pr-10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
          />
          <button type="submit" className="absolute right-0 top-0 mt-3 mr-4">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M12.9 14.32a8 8 0 111.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 108 2a6 6 0 000 12z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="hidden sm:inline">{isOnline ? t('header.online') : t('header.offline')}</span>
        </div>
        
        <select
          value={language}
          onChange={handleLanguageChange}
          className="bg-transparent text-sm p-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
        >
          <option value={Language.EN}>EN</option>
          <option value={Language.EL}>EL</option>
        </select>

        <div className="relative" ref={profileMenuRef}>
          <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} aria-label="Your avatar" className="focus:outline-none">
            <img
              className="h-9 w-9 rounded-full object-cover border-2 border-transparent hover:border-blue-500 transition-colors"
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              alt="User avatar"
            />
          </button>
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border dark:border-gray-700 animate-fade-in">
              {/* FIX: Property 'name' does not exist on type 'User'. Use party.partyName properties instead. */}
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 font-semibold">{currentUser ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}` : ''}</div>
              <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('nav.profile')}</Link>
              <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('nav.settings')}</Link>
              <Link to="/logout" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('header.logout')}</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;