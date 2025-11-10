
import React from 'react';
// FIX: Import from types
import { MicrositeConfig } from '../../types';
import { SOCIAL_PLATFORMS } from '../../constants';
import { useLocalization } from '../../hooks/useLocalization';

interface MicrositeFooterProps {
    config: MicrositeConfig;
}

const MicrositeFooter: React.FC<MicrositeFooterProps> = ({ config }) => {
    const { t } = useLocalization();

    return (
        <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
            <div className="max-w-5xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div>
                    <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">{t('micrositeBuilder.footer.contactUs')}</h4>
                    <p className="text-sm">{config.address}</p>
                    <p className="text-sm mt-1"><strong>E:</strong> <a href={`mailto:${config.contactEmail}`} className="hover:text-blue-500">{config.contactEmail}</a></p>
                    <p className="text-sm"><strong>P:</strong> <a href={`tel:${config.contactPhone}`} className="hover:text-blue-500">{config.contactPhone}</a></p>
                </div>

                {/* Social Links */}
                <div>
                    <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">{t('micrositeBuilder.footer.followUs')}</h4>
                    <div className="flex gap-4">
                        {Object.entries(config.social).map(([key, url]) => {
                            if (!url || url === '#') return null;
                            const platform = SOCIAL_PLATFORMS.find(p => p.key === key);
                            if (!platform) return null;
                            return (
                                <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500">
                                    {/* FIX: Removed cloneElement as it was causing a type error and was redundant. The icon already has the correct classes. */}
                                    {platform.icon}
                                </a>
                            );
                        })}
                    </div>
                </div>

                 {/* Site Title */}
                <div className="md:text-right">
                     <h4 className="font-bold text-xl" style={{ color: config.themeColor }}>{config.siteTitle}</h4>
                </div>
            </div>
             <div className="border-t dark:border-gray-700 py-4 text-center text-xs">
                &copy; {new Date().getFullYear()} {config.siteTitle}. {t('micrositeBuilder.footer.copyright') as string}
            </div>
        </footer>
    );
};

export default MicrositeFooter;
