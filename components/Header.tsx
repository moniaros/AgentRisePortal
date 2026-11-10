import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useClickOutside } from '../hooks/useClickOutside';
import { Language } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { getAvatarDataUri } from '../lib/avatars';

interface HeaderProps {
    onToggleSidebar: () => void;
    onOpenCommandPalette?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenCommandPalette }) => {
    const { language, setLanguage, t } = useLocalization();
    const { currentUser } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const [isQuickCreateOpen, setQuickCreateOpen] = useState(false);
    const [creditsSummary, setCreditsSummary] = useState<{ used: number; limit: number }>({
        used: 4500,
        limit: 5000,
    });

    const profileMenuRef = useRef<HTMLDivElement>(null);
    const quickCreateRef = useRef<HTMLDivElement>(null);

    useClickOutside(profileMenuRef, () => setProfileMenuOpen(false));
    useClickOutside(quickCreateRef, () => setQuickCreateOpen(false));

    useEffect(() => {
        const agencyId = currentUser?.agencyId || 'agency_1';
        fetch(`/api/billing/usage?agencyId=${encodeURIComponent(agencyId)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.aiCredits) {
                    setCreditsSummary({
                        used: data.aiCredits.used,
                        limit: data.aiCredits.limit,
                    });
                }
            })
            .catch(() => {});

        const handleCreditsEvent = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.aiCredits) {
                setCreditsSummary({
                    used: detail.aiCredits.used,
                    limit: detail.aiCredits.limit,
                });
            }
        };
        window.addEventListener('agentos:credits-updated', handleCreditsEvent);
        return () => window.removeEventListener('agentos:credits-updated', handleCreditsEvent);
    }, [currentUser?.agencyId]);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    const fullName = currentUser
        ? `${currentUser.party.partyName.firstName} ${currentUser.party.partyName.lastName}`
        : 'Advisor';
    const avatarSrc =
        currentUser?.party.profilePhotoUrl || getAvatarDataUri(fullName, '#2563eb');
    const creditsRemaining = Math.max(0, creditsSummary.limit - creditsSummary.used);

    return (
        <header className="flex items-center justify-between px-4 sm:px-6 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white focus:outline-none lg:hidden"
                    aria-label="Toggle sidebar"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                <button
                    type="button"
                    onClick={onOpenCommandPalette}
                    className="hidden sm:flex items-center justify-between w-64 md:w-80 h-9 px-3.5 rounded-lg bg-slate-100 dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-300 hover:border-blue-400 transition-colors"
                >
                    <span className="flex items-center gap-2 truncate">
                        <svg
                            className="h-3.5 w-3.5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <span>{t('header.search')}</span>
                    </span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-600">
                        ⌘K
                    </kbd>
                </button>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Quick Create Menu */}
                <div className="relative" ref={quickCreateRef}>
                    <button
                        type="button"
                        onClick={() => setQuickCreateOpen((v) => !v)}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + New
                    </button>
                    {isQuickCreateOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1.5 z-30 border border-gray-200 dark:border-gray-700 text-xs">
                            <Link
                                to="/pipeline/board"
                                onClick={() => setQuickCreateOpen(false)}
                                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                            >
                                Comparative Quote &amp; Bind
                            </Link>
                            <Link
                                to="/gap-analysis"
                                onClick={() => setQuickCreateOpen(false)}
                                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                            >
                                Scan Policy PDF (ACORD)
                            </Link>
                            <Link
                                to="/ad-campaigns"
                                onClick={() => setQuickCreateOpen(false)}
                                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                            >
                                Launch Lead Campaign
                            </Link>
                            <Link
                                to="/crm/automation-rules/new"
                                onClick={() => setQuickCreateOpen(false)}
                                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                            >
                                New Automation Rule
                            </Link>
                        </div>
                    )}
                </div>

                {/* Live AI Credits Meter Link */}
                <Link
                    to="/billing"
                    className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 transition-colors tabular-nums"
                    title="Manage AI Credits & Flex-Budget"
                >
                    <span className="text-gray-400">Credits:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {creditsRemaining.toLocaleString()}
                    </span>
                </Link>

                {/* Theme Toggle */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-semibold"
                >
                    {theme === 'dark' ? 'Light' : 'Dark'}
                </button>

                <select
                    aria-label="Language"
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-transparent text-xs font-semibold px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                >
                    <option value={Language.EN}>EN</option>
                    <option value={Language.EL}>EL</option>
                </select>

                <div className="relative" ref={profileMenuRef}>
                    <button
                        onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                        aria-label="Your avatar"
                        className="focus:outline-none flex items-center"
                    >
                        <img
                            className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-colors"
                            src={avatarSrc}
                            alt="User avatar"
                        />
                    </button>
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-1.5 z-30 border border-gray-200 dark:border-gray-700 animate-fade-in">
                            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 font-semibold truncate">
                                {fullName}
                            </div>
                            <Link
                                to="/profile"
                                onClick={() => setProfileMenuOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                {t('nav.profile')}
                            </Link>
                            <Link
                                to="/settings"
                                onClick={() => setProfileMenuOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                {t('nav.settings')}
                            </Link>
                            <Link
                                to="/logout"
                                onClick={() => setProfileMenuOpen(false)}
                                className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                {t('header.logout')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;