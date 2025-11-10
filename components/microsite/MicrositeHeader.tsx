import React, { useState } from 'react';
import { MicrositeConfig, MicrositeBlock } from '../../types';

interface MicrositeHeaderProps {
    config: MicrositeConfig;
    blocks: MicrositeBlock[];
}

const MicrositeHeader: React.FC<MicrositeHeaderProps> = ({ config, blocks }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleScrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
    };

    return (
        <header className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 z-10 shadow-sm">
            <div className="flex justify-between items-center max-w-5xl mx-auto">
                <div className="font-bold text-xl cursor-pointer" style={{ color: config.themeColor }} onClick={() => handleScrollTo(blocks[0]?.id)}>
                    {config.siteTitle}
                </div>
                
                {/* Desktop Nav */}
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                    {blocks.map(block => (
                        <button key={block.id} onClick={() => handleScrollTo(block.id)} className="capitalize hover:text-blue-500 transition">
                            {block.type}
                        </button>
                    ))}
                </nav>

                {/* Mobile Nav Button */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                 <div className="md:hidden mt-4">
                     <nav className="flex flex-col items-center gap-4 text-sm font-medium">
                        {blocks.map(block => (
                            <button key={block.id} onClick={() => handleScrollTo(block.id)} className="capitalize py-2 hover:text-blue-500 transition">
                                {block.type}
                            </button>
                        ))}
                    </nav>
                 </div>
            )}
        </header>
    );
};

export default MicrositeHeader;