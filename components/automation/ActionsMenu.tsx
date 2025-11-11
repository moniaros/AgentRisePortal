import React, { useState, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ActionsMenuProps {
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onTest: () => void;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({ onEdit, onDuplicate, onDelete, onTest }) => {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useClickOutside(menuRef, () => setIsOpen(false));

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    {t('common.actions')}
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <button onClick={onTest} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('automationRules.actions.test')}</button>
                        <button onClick={onEdit} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('automationRules.actions.edit')}</button>
                        <button onClick={onDuplicate} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('automationRules.actions.duplicate')}</button>
                        <button onClick={onDelete} className="w-full text-left block px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('automationRules.actions.delete')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionsMenu;