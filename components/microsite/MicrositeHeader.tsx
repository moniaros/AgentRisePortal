import React from 'react';
import { MicrositeSettings } from '../../types';

interface MicrositeHeaderProps {
    settings: MicrositeSettings;
}

const MicrositeHeader: React.FC<MicrositeHeaderProps> = ({ settings }) => {
    return (
        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <div className="font-bold text-xl" style={{ color: settings.themeColor }}>
                {settings.companyName}
            </div>
            <nav className="flex gap-4 text-sm">
                <a href="#" className="hover:text-blue-500">Home</a>
                <a href="#" className="hover:text-blue-500">Products</a>
                <a href="#" className="hover:text-blue-500">Contact</a>
            </nav>
        </header>
    );
};

export default MicrositeHeader;
