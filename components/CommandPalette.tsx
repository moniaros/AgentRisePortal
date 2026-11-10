import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrmData } from '../hooks/useCrmData';
import { usePipelineData } from '../hooks/usePipelineData';
import { useLocalization } from '../hooks/useLocalization';
import { useTheme } from '../context/ThemeContext';
import { Language } from '../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CommandItem {
    id: string;
    category: 'Quick Actions' | 'Clients' | 'Pipeline Deals' | 'Navigation';
    title: string;
    subtitle: string;
    onSelect: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { customers } = useCrmData();
    const { opportunities } = usePipelineData();
    const { language, setLanguage } = useLocalization();
    const { theme, toggleTheme } = useTheme();

    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 20);
        }
    }, [isOpen]);

    const allItems: CommandItem[] = useMemo(() => {
        const go = (path: string) => () => {
            navigate(path);
            onClose();
        };

        const actions: CommandItem[] = [
            {
                id: 'act-pipeline',
                category: 'Quick Actions',
                title: 'Open Comparative Rater & Deal Board',
                subtitle: 'Quote 6 carriers & bind policies in 1 click',
                onSelect: go('/pipeline/board'),
            },
            {
                id: 'act-gap',
                category: 'Quick Actions',
                title: 'Scan & Audit Insurance Policy (ACORD AI)',
                subtitle: 'Extract coverages, risk score, and E&O waivers',
                onSelect: go('/gap-analysis'),
            },
            {
                id: 'act-wallet',
                category: 'Quick Actions',
                title: 'Open Digital Policyholder Wallet & FNOL',
                subtitle: 'Preview client self-service certificates & claims intake',
                onSelect: go('/client-wallet'),
            },
            {
                id: 'act-rule',
                category: 'Quick Actions',
                title: 'Create Omnichannel Automation Rule',
                subtitle: 'Natural-language AI workflow builder',
                onSelect: go('/crm/automation-rules/new'),
            },
            {
                id: 'act-theme',
                category: 'Quick Actions',
                title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Interface Theme`,
                subtitle: 'Toggle workspace appearance',
                onSelect: () => {
                    toggleTheme();
                    onClose();
                },
            },
            {
                id: 'act-lang',
                category: 'Quick Actions',
                title: `Switch Language to ${language === Language.EN ? 'Ελληνικά (EL)' : 'English (EN)'}`,
                subtitle: 'Bilingual EU/Greek localization',
                onSelect: () => {
                    setLanguage(language === Language.EN ? Language.EL : Language.EN);
                    onClose();
                },
            },
        ];

        const clientItems: CommandItem[] = customers.map((c) => ({
            id: `cust-${c.id}`,
            category: 'Clients',
            title: `${c.firstName} ${c.lastName}`,
            subtitle: `${c.email} • ${c.policies.length} active policies`,
            onSelect: go(`/customer/${c.id}`),
        }));

        const dealItems: CommandItem[] = opportunities.slice(0, 12).map((o) => ({
            id: `opp-${o.id}`,
            category: 'Pipeline Deals',
            title: o.title,
            subtitle: `Stage: ${o.stage.toUpperCase()} • €${o.value.toLocaleString()}`,
            onSelect: go('/pipeline/board'),
        }));

        const navItems: CommandItem[] = [
            { id: 'nav-dash', category: 'Navigation', title: 'Agency Command Dashboard', subtitle: 'KPIs & T-90 Renewal Radar', onSelect: go('/') },
            { id: 'nav-inbox', category: 'Navigation', title: 'Leads Inbox', subtitle: 'Inbound quote & campaign inquiries', onSelect: go('/pipeline/inbox') },
            { id: 'nav-crm', category: 'Navigation', title: 'Micro-CRM Book of Business', subtitle: 'Customers & Leads directory', onSelect: go('/micro-crm') },
            { id: 'nav-exec', category: 'Navigation', title: 'Executive & Commission Bordereaux', subtitle: 'GWP, 60/40 producer splits & ROI', onSelect: go('/executive-dashboard') },
            { id: 'nav-bill', category: 'Navigation', title: 'Billing, AI Credits & myDATA', subtitle: 'Flex-Budget caps & VAT invoices', onSelect: go('/billing') },
            { id: 'nav-camp', category: 'Navigation', title: 'Paid Ad Campaigns', subtitle: 'Meta/Google funnels & instant quote magnets', onSelect: go('/ad-campaigns') },
            { id: 'nav-micro', category: 'Navigation', title: 'Agency Microsite Builder', subtitle: 'Custom insurance landing blocks', onSelect: go('/microsite-builder') },
        ];

        return [...actions, ...clientItems, ...dealItems, ...navItems];
    }, [customers, opportunities, language, setLanguage, theme, toggleTheme, navigate, onClose]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allItems.slice(0, 14);
        return allItems.filter(
            (item) =>
                item.title.toLowerCase().includes(q) ||
                item.subtitle.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q)
        );
    }, [allItems, query]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (filtered.length ? (prev + 1) % filtered.length : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) =>
                filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0
            );
        } else if (e.key === 'Enter' && filtered[activeIndex]) {
            e.preventDefault();
            filtered[activeIndex].onSelect();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Global Command Palette"
        >
            <div
                className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 gap-3">
                    <svg
                        className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Jump to client, deal, policy scanner, wallet, or action..."
                        className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                    />
                    <kbd className="px-2 py-0.5 text-[11px] font-mono text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded">
                        ESC
                    </kbd>
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
                    {filtered.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">
                            No matching clients, deals, or commands for "{query}".
                        </div>
                    ) : (
                        filtered.map((item, idx) => {
                            const isSelected = idx === activeIndex;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    onClick={item.onSelect}
                                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-4 transition-colors ${
                                        isSelected
                                            ? 'bg-blue-50 dark:bg-blue-900/30'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {item.title}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate tabular-nums">
                                            {item.subtitle}
                                        </div>
                                    </div>
                                    <span className="flex-shrink-0 px-2 py-0.5 text-[11px] font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        {item.category}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-500">
                    <span>↑↓ to navigate • Enter to open</span>
                    <span className="font-mono">⌘K / Ctrl+K</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
