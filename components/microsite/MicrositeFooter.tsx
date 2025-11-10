import React from 'react';
import { MicrositeSettings } from '../../types';

interface MicrositeFooterProps {
    settings: MicrositeSettings;
}

const MicrositeFooter: React.FC<MicrositeFooterProps> = ({ settings }) => {
    return (
        <footer className="p-4 border-t dark:border-gray-700 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {settings.companyName}. All rights reserved.
        </footer>
    );
};

export default MicrositeFooter;
